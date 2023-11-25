import { Field, InputType, Int } from '@nestjs/graphql';

@InputType()
export class PaginationInput {
  @Field(() => Int)
  page = 1;

  @Field(() => Int)
  pageSize = 10;

  constructor(page = 1, pageSize = 10) {
    this.page = page;
    this.pageSize = pageSize;
  }
}
