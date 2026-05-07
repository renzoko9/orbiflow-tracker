import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { AIInsight } from '../entities/ai-insight.entity';

@Injectable()
export class AIInsightRepository extends Repository<AIInsight> {
  constructor(private dataSource: DataSource) {
    super(AIInsight, dataSource.createEntityManager());
  }
}
