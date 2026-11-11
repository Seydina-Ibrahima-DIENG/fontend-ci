// Pipeline CI du frontend Jangalma (Angular)
// Checkout -> Build -> Scan du code -> Image Docker -> Scan Trivy -> Push Docker Hub
pipeline {
    agent any

    environment {
        IMAGE_NAME = 'seckou04/jangalma-frontend'
        IMAGE_TAG  = "${env.BUILD_NUMBER}"
    }

    options {
        timestamps()
        buildDiscarder(logRotator(numToKeepStr: '10'))
        timeout(time: 60, unit: 'MINUTES')
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        
        stage('Build') {
            // On emprunte un conteneur Node 22 juste le temps de cette étape
            agent {
                docker {
                    image 'node:22-alpine'
                    reuseNode true
                }
            }
                environment {
                npm_config_cache = "${WORKSPACE}/.npm"
                // Connexion instable : npm réessaie et attend plus longtemps avant d'abandonner
                npm_config_fetch_retries = '5'
                npm_config_fetch_retry_mintimeout = '20000'
                npm_config_fetch_retry_maxtimeout = '120000'
                npm_config_fetch_timeout = '600000'
            }
            steps {
                sh 'npm ci --prefer-offline --no-audit --no-fund'
                sh 'npm run build'
            }
        }

        stage('Scan du code (npm audit)') {
            agent {
                docker {
                    image 'node:22-alpine'
                    reuseNode true
                }
            }
            environment {
                npm_config_cache = "${WORKSPACE}/.npm"
            }
            steps {
                // Rapport complet conservé pour le rapport de sécurité
                sh 'npm audit --json > npm-audit.json || true'
                // Le pipeline échoue seulement si une faille CRITIQUE est trouvée
                sh 'npm audit --audit-level=critical'
            }
        }
        
        stage('Image Docker') {
            steps {
                // Deux tags : la version unique (numéro de build) et "latest"
                sh 'docker build -t $IMAGE_NAME:$IMAGE_TAG -t $IMAGE_NAME:latest .'
            }
        }

        stage('Scan de l\'image (Trivy)') {
            steps {
                // Rapport complet (HIGH + CRITICAL) conservé pour le rapport de sécurité
                sh '''
                    docker run --rm \
                      -v /var/run/docker.sock:/var/run/docker.sock \
                      -v trivy-cache:/root/.cache/ \
                      aquasec/trivy:latest image \
                      --no-progress --severity HIGH,CRITICAL --exit-code 0 \
                      $IMAGE_NAME:$IMAGE_TAG > trivy-frontend.txt
                '''
                // Le pipeline échoue si une faille CRITIQUE corrigeable est trouvée
                sh '''
                    docker run --rm \
                      -v /var/run/docker.sock:/var/run/docker.sock \
                      -v trivy-cache:/root/.cache/ \
                      aquasec/trivy:latest image \
                      --no-progress --skip-db-update --ignore-unfixed \
                      --severity CRITICAL --exit-code 1 \
                      $IMAGE_NAME:$IMAGE_TAG
                '''
            }
        }
        
        stage('Push Docker Hub') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'dockerhub-credentials',
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_PASS'
                )]) {
                    sh 'echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin'
                    sh 'docker push $IMAGE_NAME:$IMAGE_TAG'
                    sh 'docker push $IMAGE_NAME:latest'
                }
            }
        }
    }

    post {
        always {
            // Rapports de sécurité conservés avec chaque build (onglet "Artefacts")
            archiveArtifacts artifacts: 'npm-audit.json, trivy-frontend.txt', allowEmptyArchive: true
            sh 'docker logout || true'
        }
        success {
            echo "✅ Image publiée : ${IMAGE_NAME}:${IMAGE_TAG}"
        }
        failure {
            echo '❌ Le pipeline frontend a échoué : voir les logs de l\'étape en rouge'
        }
    }
}