workspace "XJustiz-Bridge" "C4 Model in the context of the Access to Justice project, focused on the XJustiz-Bridge" {
    model {
        xJustizBridge = softwareSystem "XJustiz-Bridge" "The subsystem team's product. Provides domain functionality via a TypeScript library backed by an internal service." {
            xJustizTools = container "XJustiz-Tools" "Third-party implementation (vendor-supplied JAR). Managed and operated by the Court Communication team. Provides a REST API." "Java Service / OCI Container" "Third Party"

            
            library = container "Library" "The primary artifact - consumed as an npm dependency.\nRuns inside the consumer's JavaScript environment.Exposes functionality to compose XJustiz messages and communicates with the XJustiz-Tools." "TypeScript Library" {
                -> xJustizTools "Call XML Generator Endpoint" "HTTP REST"
                
                metatypes = component "Metatypes" "Utilities for type algebra to enable strong type-driven development."
            
                xJustizSchemata = component "XJustiz Schemata" "Scalars and message types for the schamata of the XJustiz standard". {
                    -> metatypes
                }
                
                messageProfiles = component "Message Profiles" "Narrowed conformance profiles of XJustiz messages for specific application use-cases (e.g. Zahlungsklage)." {
                    -> xJustizSchemata
                    -> metatypes
                }
            
                messageOrchestrators = component "Message Orchestrators" "Framework to compose messages with managed identity constraints and cross document invariants." "Public API" {
                    -> messageProfiles
                    -> metatypes
                    tags "Public API"
                }
                
                ergonomics = component "Ergonomics" "Ergonomics to reduce boilerplate when composing complex messages like with templates." "Public API" {
                    -> messageProfiles
                    -> xJustizSchemata
                    tags "Public API"
                }
            }
            
        }
        
        consumerApplication = softwareSystem "Consumer Application" "JavaScript based application that uses XJustiz-Bridge to compose XJustiz messages." "External" {
            javascriptRuntime = container "JavaScript Runtime" "Runs the library in-process" {
                -> library "Compose XJustiz Message & Use Input Schemata" "In-Process"
            }
        }
    }

    views {
        container xJustizBridge "ContainerView" "XJustiz-Bridge - Court Communication" {
            include *
            autoLayout
        }
        
        component library "ComponentView" "XJustiz-Bridge - Court Communication" {
            include *
            autoLayout tb
        }
    
        styles {
            element "Software System" {
                color #2a2b2d
                background #e0f0ff
                color #2a2b2d
                stroke #81878e
            }
            
            element "Container" {
                color #2a2b2d
                background #e0f0ff
                stroke #81878e
            }
            
            element "Component" {
                color #2a2b2d
                background #e0f0ff
                stroke #81878e
            }
            
            element "External" {
                shape Hexagon
                background #a3f0d0
            }
            
            element "Third Party" {
                background #1168bd
                color #ffffff
                border Dashed
                stroke #ffffff
            }
            
            element "Public API" {
                background #1168bd
                color #ffffff
                stroke #ffffff
                border Solid
            }
    
        }
    }
}
