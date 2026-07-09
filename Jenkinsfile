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
                bat 'npx puppeteer browsers install chrome'
            }
        }

        stage('Run Main Test Suite') {
            steps {
                script {
                    def tagExpression = ''
                    switch(params.TEST_SCOPE) {
                        case 'all':
                            tagExpression = 'not @bug'
                            break
                        case 'positive':
                            tagExpression = '@positive and not @bug'
                            break
                        case 'negative':
                            tagExpression = '@negative and not @bug'
                            break
                        case 'bug':
                            tagExpression = '@bug'
                            break
                        case 'smoke':
                            tagExpression = '@smoke'
                            break
                        case 'custom':
                            tagExpression = params.CUSTOM_TAG
                            break
                        default:
                            tagExpression = 'not @bug'
                    }
                    echo "Running scenarios with tag expression: ${tagExpression}"
                    bat "npx cucumber-js --tags \"${tagExpression}\""
                }
            }
        }

        stage('Generate Step PDF (Main)') {
            steps {
                bat 'node scripts/generate-step-pdf.js'
            }
        }

        stage('Publish Cucumber Report') {
            steps {
                cucumber buildStatus: 'UNSTABLE',
                         fileIncludePattern: 'reports/cucumber-report.json'
            }
        }

        stage('Archive Main Test Results') {
            steps {
                archiveArtifacts artifacts: 'reports/videos/**, reports/screenshots/**, reports/pdf/**, reports/cucumber-report.json', allowEmptyArchive: true
            }
        }

        stage('Run Known Bug Scenarios') {
            when {
                expression { params.TEST_SCOPE == 'all' }
            }
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
            when {
                expression { params.TEST_SCOPE == 'all' }
            }
            steps {
                bat 'node scripts/generate-step-pdf.js'
            }
        }

        stage('Archive Bug Tracking Results') {
            when {
                expression { params.TEST_SCOPE == 'all' }
            }
            steps {
                archiveArtifacts artifacts: 'reports/videos/**, reports/screenshots/**, reports/pdf/**', allowEmptyArchive: true, fingerprint: true
            }
        }

        stage('Run Allure Recording (Optional)') {
            when {
                expression { params.RUN_ALLURE == true }
            }
            steps {
                script {
                    // def allureResult = bat(script: 'npx cucumber-js --format allure-cucumberjs/reporter --format-options "{\\"resultsDir\\":\\"allure-results\\"}"', returnStatus: true)
                    def allureResult = bat(script: 'npx cucumber-js --tags "not @bug" --format allure-cucumberjs/reporter --format-options "{\\"resultsDir\\":\\"allure-results\\"}"', returnStatus: true)
                    if (allureResult != 0) {
                        echo "Some scenarios failed during Allure recording (expected for @bug scenarios) — continuing to publish report."
                    }
                }
            }
        }

        stage('Publish Allure Report (Optional)') {
            when {
                expression { params.RUN_ALLURE == true }
            }
            steps {
                allure includeProperties: false, results: [[path: 'allure-results']]
            }
        }
    }

    post {
        always {
            echo 'Cleaning up .env file for security...'
            bat 'if exist .env del .env'
        }
        success {
            echo 'Test run completed. Check reports for details.'
        }
        failure {
            echo 'Test suite failed — check artifacts for evidence.'
        }
    }
}