pipeline {
  agent any
  tools { nodejs "node" }
  environment {
    imageName = "heyitsnaim/remix-portfolio"
    registryCredential = 'heyitsnaim'
    dockerImage = ''
  }
  stages {
    stage("Install Dependencies"){
      steps{
        sh 'npm install'
      }
    }
    stage("Building Image"){
      steps{
        script {
          dockerImage = docker.build imageName
        }
      }
    }
    stage("Deploy Image"){
      steps{
        script {
          docker.withRegistry("https://registry.hub.docker.com", 'dockerhub-creds'){
            dockerImage.push("${env.BUILD_NUMBER}")
          }
        }
      }
    }
  }
}