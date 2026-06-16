// ============================================================================
// DevHub backend → Azure Container Apps (Infrastructure as Code)
// ----------------------------------------------------------------------------
// Creates a Container Apps environment + the backend app, wired with the same
// env vars the container expects everywhere else. Secrets are stored as
// Container App secrets and referenced by env vars (not baked into the image).
//
// Deploy:
//   az group create -n devhub-rg -l eastus
//   az deployment group create -g devhub-rg \
//     --template-file deploy/azure/containerapp.bicep \
//     --parameters containerImage=<acr>.azurecr.io/devhub-backend:latest \
//                  corsOrigins=https://<YOURNAME>.github.io \
//                  databaseUrl='jdbc:postgresql://<host>:5432/<db>' \
//                  databaseUsername=<user> databasePassword=<pwd> jwtSecret=<secret>
// ============================================================================

@description('Azure region')
param location string = resourceGroup().location

@description('Container app name')
param appName string = 'devhub-backend'

@description('Full image reference, e.g. myacr.azurecr.io/devhub-backend:latest')
param containerImage string

@description('Allowed CORS origin (your GitHub Pages site), e.g. https://yourname.github.io')
param corsOrigins string

@secure()
@description('JDBC URL: jdbc:postgresql://host:5432/db')
param databaseUrl string

@secure()
param databaseUsername string

@secure()
param databasePassword string

@secure()
@description('HS256 signing secret, 32+ chars')
param jwtSecret string

@description('ACR login server for image pull (leave blank for a public image)')
param acrServer string = ''

@description('ACR username (leave blank if using a public image)')
param acrUsername string = ''

@secure()
@description('ACR password (leave blank if using a public image)')
param acrPassword string = ''

var baseSecrets = [
  { name: 'database-url', value: databaseUrl }
  { name: 'database-username', value: databaseUsername }
  { name: 'database-password', value: databasePassword }
  { name: 'jwt-secret', value: jwtSecret }
]
var acrSecret = empty(acrServer) ? [] : [ { name: 'acr-password', value: acrPassword } ]

resource env 'Microsoft.App/managedEnvironments@2024-03-01' = {
  name: '${appName}-env'
  location: location
  properties: {}
}

resource app 'Microsoft.App/containerApps@2024-03-01' = {
  name: appName
  location: location
  properties: {
    managedEnvironmentId: env.id
    configuration: {
      ingress: {
        external: true
        targetPort: 8080
        transport: 'auto'
      }
      secrets: concat(baseSecrets, acrSecret)
      registries: empty(acrServer) ? [] : [
        {
          server: acrServer
          username: acrUsername
          passwordSecretRef: 'acr-password'
        }
      ]
    }
    template: {
      containers: [
        {
          name: appName
          image: containerImage
          resources: {
            cpu: json('1.0')
            memory: '2Gi'
          }
          env: [
            { name: 'SPRING_PROFILES_ACTIVE', value: 'prod' }
            { name: 'EXEC_ENABLED', value: 'false' }
            { name: 'CORS_ALLOWED_ORIGINS', value: corsOrigins }
            { name: 'DATABASE_URL', secretRef: 'database-url' }
            { name: 'DATABASE_USERNAME', secretRef: 'database-username' }
            { name: 'DATABASE_PASSWORD', secretRef: 'database-password' }
            { name: 'JWT_SECRET', secretRef: 'jwt-secret' }
          ]
          probes: [
            {
              type: 'Liveness'
              httpGet: { path: '/actuator/health', port: 8080 }
              initialDelaySeconds: 30
              periodSeconds: 30
            }
            {
              type: 'Readiness'
              httpGet: { path: '/actuator/health', port: 8080 }
              initialDelaySeconds: 15
              periodSeconds: 15
            }
          ]
        }
      ]
      scale: {
        minReplicas: 1
        maxReplicas: 3
      }
    }
  }
}

@description('Public HTTPS URL — put this in frontend/config.js')
output appUrl string = 'https://${app.properties.configuration.ingress.fqdn}'
