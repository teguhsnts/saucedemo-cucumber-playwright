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
        JIRA_BASE_URL = 'https://teguhsnts2903.atlassian.net'
        JIRA_PROJECT_KEY = 'SD'
        TESTRAIL_URL = 'https://teguhsnts.testrail.io'
        TESTRAIL_PROJECT_ID = '2'
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

                    def mainResult = bat(script: "npx cucumber-js --tags \"${tagExpression}\"", returnStatus: true)

                    if (mainResult != 0) {
                        echo "WARNING: Main Test Suite has unexpected failures!"
                        env.MAIN_SUITE_FAILED = 'true'
                    } else {
                        env.MAIN_SUITE_FAILED = 'false'
                    }
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

        stage('Create Jira Tickets for Unexpected Failures') {
            when {
                allOf {
                    expression { env.MAIN_SUITE_FAILED == 'true' }
                    expression { params.CREATE_JIRA_BUGS == true }
                }
            }
            steps {
                withCredentials([usernamePassword(credentialsId: 'jira-api-credentials', usernameVariable: 'JIRA_EMAIL', passwordVariable: 'JIRA_API_TOKEN')]) {
                    bat 'node scripts/create-jira-bugs.js unexpected'
                }
            }
        }

        stage('Run Known Bug Scenarios') {
            when {
                expression { params.TEST_SCOPE == 'all' }
            }
            steps {
                script {
                    def bugTestResult = bat(script: 'npx cucumber-js --tags "@bug" --profile bug', returnStatus: true)
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

        stage('Create Jira Bug Tickets') {
            when {
                allOf {
                    expression { params.TEST_SCOPE == 'all' }
                    expression { params.CREATE_JIRA_BUGS == true }
                }
            }
            steps {
                withCredentials([usernamePassword(credentialsId: 'jira-api-credentials', usernameVariable: 'JIRA_EMAIL', passwordVariable: 'JIRA_API_TOKEN')]) {
                    bat 'node scripts/create-jira-bugs.js known'
                }
            }
        }
        stage('Sync to TestRail') {
            when {
                expression { params.SYNC_TESTRAIL == true }
            }
            steps {
                withCredentials([usernamePassword(credentialsId: 'testrail-api-credentials', usernameVariable: 'TESTRAIL_USER', passwordVariable: 'TESTRAIL_API_KEY')]) {
                    bat 'node scripts/sync-testrail.js'
                }
            }
        }
        stage('Run Allure Recording (Optional)') {
            when {
                expression { params.RUN_ALLURE == true }
            }
            steps {
                script {
                    def allureResult = bat(script: 'npx cucumber-js --tags "not @bug" --format allure-cucumberjs/reporter --format-options "{\\"resultsDir\\":\\"allure-results\\"}"', returnStatus: true)
                    if (allureResult != 0) {
                        echo "Unexpected failure during Allure recording — check main suite scenarios."
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

        stage('Final Status Check') {
            steps {
                script {
                    if (env.MAIN_SUITE_FAILED == 'true') {
                        error("Main Test Suite has unexpected failures. Jira ticket created for investigation.")
                    }
                }
            }
        }
    }

    post {
        always {
            echo 'Cleaning up .env file for security...'
            bat 'if exist .env del .env'
        }
        success {
            echo 'Test run completed successfully. Check reports for details.'
        }
        failure {
            echo 'Test suite failed — check artifacts and Jira for evidence.'
        }
    }
}