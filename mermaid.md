````
flowchart LR
  subgraph K8s
    API[API Gateway / GraphQL]
    FinanceSvc[Finance Service]
    NutritionSvc[Nutrition Service]
    ScoringSvc[Scoring Service]
    Workers[Worker Pool]
    Realtime[Realtime WS Service]
  end

  API -->|HTTP/gRPC| FinanceSvc
  API -->|HTTP/gRPC| NutritionSvc
  API -->|HTTP/gRPC| ScoringSvc

  FinanceSvc -->|writes| PostgresFinance[(Postgres: finance_db)]
  NutritionSvc -->|writes| Mongo[(Mongo: nutrition)]
  NutritionSvc -->|aggregates| PostgresAnalytics[(Postgres: analytics_db)]
  ScoringSvc -->|writes ledger| PostgresFinance

  Workers -->|consume| Rabbit[(RabbitMQ)]
  FinanceSvc -->|publish events| Rabbit
  NutritionSvc -->|publish events| Rabbit
  ScoringSvc -->|consume| Rabbit

  Realtime -->|subscribe| Redis[(Redis Cluster)]
  ScoringSvc -->|cache/streaks| Redis
  NutritionSvc -->|cache| Redis

  NutritionSvc -->|store files| S3[(S3 Storage)]
```