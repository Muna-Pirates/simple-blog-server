import { ObjectType, Field, Int, ID } from '@nestjs/graphql';
import { Category } from 'src/category/types/category.types';
import { User } from 'src/user/types/user.types';
import { Comment } from 'src/comment/types/comment.types';

@ObjectType({ description: '게시글을 나타내는 객체' })
export class Post {
  @Field(() => ID, { description: '게시글의 고유 식별자' })
  id: number;

  @Field({ description: '게시글의 제목' })
  title: string;

  @Field({ description: '게시글의 내용' })
  content: string;

  @Field(() => Int, { description: '게시글 작성자의 ID' })
  authorId: number;

  @Field(() => User, { description: '게시글의 작성자 정보' })
  author: User;

  @Field(() => [Comment], {
    nullable: 'itemsAndList',
    description: '게시글에 달린 댓글들',
  })
  comments: Comment[];

  @Field(() => Int, {
    nullable: true,
    description: '게시글의 카테고리 ID (없을 수 있음)',
  })
  categoryId?: number;

  @Field(() => Category, {
    nullable: true,
    description: '게시글의 카테고리 정보 (없을 수 있음)',
  })
  category?: Category;

  @Field({ description: '게시글이 생성된 날짜 및 시간' })
  createdAt: Date;

  @Field({ description: '게시글이 마지막으로 업데이트된 날짜 및 시간' })
  updatedAt: Date;
}
