pipeline {
    agent any
    stages {
        stage('Checkout') {
            steps {
                checkout([
                    $class: 'GitSCM', 
                    branches: [[name: '*/main']], 
                    doGenerateSubmoduleConfigurations: false, 
                    extensions: [], 
                    submoduleCfg: [], 
                    userRemoteConfigs: [[url: 'https://github.com/Team4-DevWave/Backend', credentialsId: 'hooks']]
                ])
            }
        }
        stage('Build') {
            options {
                timeout(time: 6, unit: 'MINUTES')
            }
            steps {
             sh 'docker build --cache-from hassanhatem/back:latest -t hassanhatem/back:latest .'
            }
        }
        // stage('Test') {
        // steps {
        //     withCredentials([usernamePassword(credentialsId: 'docker', usernameVariable: 'DOCKER_USERNAME', passwordVariable: 'DOCKER_PASSWORD')]) {
        //             sh 'echo $DOCKER_PASSWORD | docker login -u $DOCKER_USERNAME --password-stdin'
        //     sh 'docker run -d --name testing hassanhatem/back:latest'
        //     sh 'docker exec  testing npx jest /tests/routes/commentroutes.test.js'
        //     sh 'docker exec  testing npx jest /tests/routes/messageroutes.test.js'
        //     sh 'docker exec  testing npx jest /tests/routes/postroutes.test.js'
        //     // sh 'docker exec  testing npx jest /tests/routes/subreddit.test.js'
        //     // sh 'docker exec  testing npx jest /tests/routes/userroutes.test.js'
        //     sh 'docker rm -f testing'
        //     }
        // }
        // }
        stage('Push') {
            steps {
             withCredentials([usernamePassword(credentialsId: 'docker', usernameVariable: 'DOCKER_USERNAME', passwordVariable: 'DOCKER_PASSWORD')]) {
                    sh 'echo $DOCKER_PASSWORD | docker login -u $DOCKER_USERNAME --password-stdin'
                    sh 'docker push hassanhatem/back:latest'
                }
            }
}
        
    }
}