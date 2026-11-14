#!/usr/bin/env bash
# =====================================================================================
# Rapport de sécurité comparable d'un build à l'autre (demande de l'audit sécurité).
#
#   ci/rapport-securite.sh <nom>               # génère le rapport et le compare à la référence
#   ci/rapport-securite.sh <nom> --enregistrer # le rapport courant devient la référence
#
# Entrées (celles présentes dans le workspace) :
#   target/dependency-check-report.json (OWASP), npm-audit.json, trivy-*.json
# Sorties (noms et colonnes fixes à chaque build) :
#   rapport-securite.csv     tous les constats, une ligne par constat, triés
#   constats-nouveaux.csv    apparus depuis la référence
#   constats-corriges.csv    présents dans la référence, disparus depuis
#   resume-securite.txt      résumé d'une ligne (affiché dans la description du build)
#
# Identifiant stable d'un constat = identifiant;outil;cible;paquet
#   identifiant = CVE (OWASP, Trivy) ou GHSA (npm audit) ; cible = image SANS son tag
#   (le tag est le numéro de build : il change à chaque fois et fausserait la comparaison).
# La référence est le rapport du dernier build réussi, gardée dans le volume Docker
# "securite-reference" (aucun plugin Jenkins nécessaire).
# =====================================================================================
set -euo pipefail

NOM="${1:?usage: $0 <nom> [--enregistrer]}"
VOLUME="${SECURITE_VOLUME:-securite-reference}"
JQ=(docker run --rm -i ghcr.io/jqlang/jq:1.7.1 -r)
ALPINE=alpine:3.20
ENTETE='identifiant;outil;cible;paquet;version;severite;version_corrigee'

if [ "${2:-}" = "--enregistrer" ]; then
  docker run --rm -i -v "$VOLUME:/ref" "$ALPINE" sh -c "cat > /ref/$NOM.csv" < rapport-securite.csv
  echo "Référence de sécurité mise à jour ($NOM) : $(($(wc -l < rapport-securite.csv) - 1)) constats"
  exit 0
fi

# ---------- Normalisation : une ligne par constat ----------
F_OWASP='.dependencies[]? | select(.vulnerabilities) as $d | $d.vulnerabilities[] | [
  .name, "owasp", "dependances-java",
  (($d.packages[0].id // $d.fileName) | sub("@[^@]*$"; "")),
  (($d.packages[0].id // "") | (capture("@(?<v>[^@?]+)$").v // "-")),
  (.severity | ascii_upcase), "-" ] | join(";")'

F_NPM='.vulnerabilities // {} | to_entries[] | .key as $p | .value as $v | $v.via[] | objects | [
  ((.url // "") | (capture("(?<id>GHSA-[a-z0-9-]+)").id // "npm-\(.source)")),
  "npm-audit", "frontend", $p, ($v.range // "-"), (.severity | ascii_upcase),
  (if ($v.fixAvailable | type) == "object" then $v.fixAvailable.version
   elif $v.fixAvailable then "oui" else "-" end) ] | join(";")'

F_TRIVY='(.ArtifactName | sub(":[^:/]+$"; "")) as $img | .Results[]? | .Vulnerabilities[]? | [
  .VulnerabilityID, "trivy", $img, .PkgName, .InstalledVersion, .Severity,
  (.FixedVersion // "-") ] | join(";")'

lignes=$(mktemp); sources=()
if [ -f target/dependency-check-report.json ]; then
  "${JQ[@]}" "$F_OWASP" < target/dependency-check-report.json >> "$lignes"; sources+=(owasp)
fi
if [ -f npm-audit.json ]; then
  "${JQ[@]}" "$F_NPM" < npm-audit.json >> "$lignes"; sources+=(npm-audit)
fi
for f in trivy-*.json; do
  [ -f "$f" ] || continue
  "${JQ[@]}" "$F_TRIVY" < "$f" >> "$lignes"; sources+=("trivy:${f#trivy-}")
done
{ echo "$ENTETE"; sort -u "$lignes"; } > rapport-securite.csv
rm -f "$lignes"

# ---------- Comparaison avec la référence ----------
docker run --rm -v "$VOLUME:/ref" "$ALPINE" sh -c "cat /ref/$NOM.csv 2>/dev/null || true" > reference-securite.csv

cles() { tail -n +2 "$1" | awk -F';' '{print $1";"$2";"$3";"$4}' | sort -u; }
# lignes de $2 dont la clé figure dans le fichier de clés $1
filtrer() { awk -F';' 'NR==FNR {k[$0]=1; next} FNR>1 && (($1";"$2";"$3";"$4) in k)' "$1" "$2"; }

total=$(($(wc -l < rapport-securite.csv) - 1))
if [ ! -s reference-securite.csv ]; then
  echo "$ENTETE" > constats-nouveaux.csv
  echo "$ENTETE" > constats-corriges.csv
  resume="Sécurité : $total constats, première référence (aucune comparaison possible)"
else
  comm -13 <(cles reference-securite.csv) <(cles rapport-securite.csv) > cles-nouvelles.txt
  comm -23 <(cles reference-securite.csv) <(cles rapport-securite.csv) > cles-corrigees.txt
  { echo "$ENTETE"; filtrer cles-nouvelles.txt rapport-securite.csv; } > constats-nouveaux.csv
  { echo "$ENTETE"; filtrer cles-corrigees.txt reference-securite.csv; } > constats-corriges.csv
  n=$(wc -l < cles-nouvelles.txt); c=$(wc -l < cles-corrigees.txt)
  resume="Sécurité : $total constats, $n nouveaux, $c corrigés, $((total - n)) inchangés"
  rm -f cles-nouvelles.txt cles-corrigees.txt
fi

par_outil=$(tail -n +2 rapport-securite.csv | cut -d';' -f2 | sort | uniq -c | awk '{printf "%s%s %s", (NR>1?", ":""), $2, $1}')
echo "$resume (${par_outil:-aucun constat})" | tee resume-securite.txt
echo "Sources analysées : ${sources[*]:-aucune}"
if [ "$(wc -l < constats-nouveaux.csv)" -gt 1 ]; then
  echo "Nouveaux constats :"; tail -n +2 constats-nouveaux.csv | cut -d';' -f1,2,4,6 | sed 's/^/  /'
fi
