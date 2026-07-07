pipeline {
    agent any

    tools {
        nodejs 'NodeJS-22'
    }

    options {
        timeout(time: 30, unit: 'MINUTES')
        disableConcurrentBuilds()
    }

    environment {
        CI = 'true'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Setup Environment') {
            steps {
                withCredentials([file(credentialsId: 'saucedemo-env-file', variable: 'ENV_FILE')]) {
                    bat 'copy "%ENV_FILE%" .env'
                }
            }
        }

        stage('Install Dependencies') {
            steps {
                bat 'npm ci'
                bat 'npx playwright install --with-deps chromium'
            }
        }

        stage('Run Main Test Suite') {
            steps {
                bat 'npx cucumber-js --tags "not @bug"'
            }
        }

        stage('Generate Step PDF (Main)') {
            steps {
                bat 'node scripts/generate-step-pdf.js'
            }
        }

        stage('Archive Main Test Results') {
            steps {
                archiveArtifacts artifacts: 'reports/videos/**, reports/screenshots/**, reports/pdf/**, reports/cucumber-report.json', allowEmptyArchive: true
            }
        }

        stage('Run Known Bug Scenarios') {
            steps {
                script {
                    def bugTestResult = bat(script: 'npx cucumber-js --tags "@bug"', returnStatus: true)
                    if (bugTestResult != 0) {
                        echo "Known bug scenarios failed as expected (documented defects) — this does not fail the build."
                    }
                }
            }
        }

        stage('Generate Step PDF (Bugs)') {
            steps {
                bat 'node scripts/generate-step-pdf.js'
            }
        }

        stage('Archive Bug Tracking Results') {
            steps {
                archiveArtifacts artifacts: 'reports/videos/**, reports/screenshots/**, reports/pdf/**', allowEmptyArchive: true, fingerprint: true
            }
        }
    }

    post {
        always {
            echo 'Cleaning up .env file for security...'
            bat 'if exist .env del .env'
        }
        success {
            echo 'Main test suite passed. Known bugs (if any) tracked separately.'
        }
        failure {
            echo 'Main test suite failed — check artifacts for evidence.'
        }
    }
}