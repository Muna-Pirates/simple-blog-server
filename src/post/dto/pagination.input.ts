import { Field, InputType, Int } from '@nestjs/graphql';
import { Min } from 'class-validator';

@InputType()
export class PaginationInput {
  @Field(() => Int)
  @Min(1)
  page: number;

  @Field(() => Int)
  @Min(1)
  pageSize: number;

  constructor(page = 1, pageSize = 10) {
    this.page = page;
    this.pageSize = pageSize;
  }
}
