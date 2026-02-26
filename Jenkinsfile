// Jenkins Pipeline Configuration
// Alternative CI/CD pipeline for Jenkins

pipeline {
    agent any

    environment {
        NODE_VERSION = '20'
        PYTHON_VERSION = '3.11'
        DOCKER_REGISTRY = credentials('docker-registry')
        SLACK_WEBHOOK = credentials('slack-webhook')
        AWS_CREDENTIALS = credentials('aws-credentials')
    }

    options {
        timestamps()
        timeout(time: 1, unit: 'HOURS')
        buildDiscarder(logRotator(numToKeepStr: '10'))
        disableConcurrentBuilds()
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
                script {
                    env.GIT_COMMIT_SHORT = sh(script: "git rev-parse --short HEAD", returnStdout: true).trim()
                    env.GIT_BRANCH = sh(script: "git rev-parse --abbrev-ref HEAD", returnStdout: true).trim()
                }
            }
        }

        stage('Setup') {
            parallel {
                stage('Setup Frontend') {
                    steps {
                        dir('frontend') {
                            sh '''
                                npm ci
                                npm install -g @lhci/cli
                            '''
                        }
                    }
                }

                stage('Setup Backend') {
                    steps {
                        dir('backend') {
                            sh '''
                                python -m venv venv
                                . venv/bin/activate
                                pip install --upgrade pip
                                pip install -r requirements.txt
                                pip install black flake8 coverage pytest
                            '''
                        }
                    }
                }
            }
        }

        stage('Code Quality') {
            parallel {
                stage('Frontend Lint') {
                    steps {
                        dir('frontend') {
                            sh 'npm run lint'
                        }
                    }
                }

                stage('Backend Lint') {
                    steps {
                        dir('backend') {
                            sh '''
                                . venv/bin/activate
                                black --check .
                                flake8 .
                            '''
                        }
                    }
                }

                stage('Security Scan') {
                    steps {
                        sh '''
                            # Frontend security audit
                            cd frontend && npm audit --audit-level=high

                            # Backend security audit
                            cd ../backend
                            . venv/bin/activate
                            pip-audit -r requirements.txt || true
                        '''
                    }
                }
            }
        }

        stage('Test') {
            parallel {
                stage('Frontend Tests') {
                    steps {
                        dir('frontend') {
                            sh '''
                                CI=true npm test -- --coverage --watchAll=false
                                npx playwright install --with-deps
                                npm run test:e2e || true
                            '''
                        }
                    }
                    post {
                        always {
                            publishHTML([
                                reportDir: 'frontend/coverage/lcov-report',
                                reportFiles: 'index.html',
                                reportName: 'Frontend Coverage Report'
                            ])
                            junit 'frontend/test-results/*.xml'
                        }
                    }
                }

                stage('Backend Tests') {
                    steps {
                        dir('backend') {
                            sh '''
                                . venv/bin/activate
                                coverage run --source='.' manage.py test
                                coverage xml
                                coverage html
                            '''
                        }
                    }
                    post {
                        always {
                            publishHTML([
                                reportDir: 'backend/htmlcov',
                                reportFiles: 'index.html',
                                reportName: 'Backend Coverage Report'
                            ])
                            junit 'backend/test-results/*.xml'
                        }
                    }
                }
            }
        }

        stage('Build') {
            parallel {
                stage('Build Frontend') {
                    steps {
                        dir('frontend') {
                            sh 'npm run build'
                            archiveArtifacts artifacts: 'build/**/*', fingerprint: true
                        }
                    }
                }

                stage('Build Docker Images') {
                    steps {
                        script {
                            docker.withRegistry('https://registry.hub.docker.com', 'docker-credentials') {
                                def frontendImage = docker.build("emelmujiro/frontend:${env.GIT_COMMIT_SHORT}", "./frontend")
                                def backendImage = docker.build("emelmujiro/backend:${env.GIT_COMMIT_SHORT}", "./backend")

                                if (env.GIT_BRANCH == 'main' || env.GIT_BRANCH == 'develop') {
                                    frontendImage.push()
                                    frontendImage.push('latest')
                                    backendImage.push()
                                    backendImage.push('latest')
                                }
                            }
                        }
                    }
                }
            }
        }

        stage('Performance Test') {
            when {
                branch 'main'
            }
            steps {
                dir('frontend') {
                    sh '''
                        npm run build
                        npx http-server build -p 5173 &
                        sleep 5
                        lhci autorun --collect.url=http://localhost:5173
                    '''
                }
            }
            post {
                always {
                    publishHTML([
                        reportDir: 'frontend/.lighthouseci',
                        reportFiles: 'lhr-*.html',
                        reportName: 'Lighthouse Report'
                    ])
                }
            }
        }

        stage('Deploy') {
            when {
                anyOf {
                    branch 'main'
                    branch 'develop'
                }
            }
            stages {
                stage('Deploy to Staging') {
                    when {
                        branch 'develop'
                    }
                    steps {
                        script {
                            sh '''
                                echo "Deploying to staging..."
                                # Add staging deployment commands
                            '''
                        }
                    }
                    post {
                        success {
                            slackSend(
                                color: 'good',
                                message: "Staging deployment successful! :rocket:\nBranch: ${env.GIT_BRANCH}\nCommit: ${env.GIT_COMMIT_SHORT}"
                            )
                        }
                    }
                }

                stage('Deploy to Production') {
                    when {
                        branch 'main'
                    }
                    input {
                        message "Deploy to production?"
                        ok "Deploy"
                        parameters {
                            choice(name: 'DEPLOYMENT_TYPE', choices: ['Blue-Green', 'Canary', 'Rolling'], description: 'Deployment strategy')
                        }
                    }
                    steps {
                        script {
                            sh '''
                                echo "Deploying to production with ${DEPLOYMENT_TYPE} strategy..."
                                # Add production deployment commands
                            '''
                        }
                    }
                    post {
                        success {
                            slackSend(
                                color: 'good',
                                message: "Production deployment successful! :tada:\nStrategy: ${params.DEPLOYMENT_TYPE}\nCommit: ${env.GIT_COMMIT_SHORT}"
                            )
                        }
                        failure {
                            slackSend(
                                color: 'danger',
                                message: "Production deployment failed! :x:\nCommit: ${env.GIT_COMMIT_SHORT}"
                            )
                        }
                    }
                }
            }
        }

        stage('Smoke Tests') {
            when {
                anyOf {
                    branch 'main'
                    branch 'develop'
                }
            }
            steps {
                script {
                    def targetUrl = env.GIT_BRANCH == 'main' ? 'https://emelmujiro.com' : 'https://staging.emelmujiro.com'
                    sh """
                        curl -f ${targetUrl} || exit 1
                        curl -f ${targetUrl}/api/health || exit 1
                    """
                }
            }
        }
    }

    post {
        always {
            cleanWs()
        }
        success {
            echo 'Pipeline completed successfully!'
        }
        failure {
            emailext(
                subject: "Build Failed: ${env.JOB_NAME} - ${env.BUILD_NUMBER}",
                body: "Build failed for ${env.GIT_BRANCH} branch. Check ${env.BUILD_URL} for details.",
                to: 'dev-team@emelmujiro.com'
            )
        }
    }
}
