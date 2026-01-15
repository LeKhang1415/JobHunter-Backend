import { Injectable } from '@nestjs/common';
import {
  FindManyOptions,
  FindOptionsOrder,
  FindOptionsWhere,
  ObjectLiteral,
  Repository,
  SelectQueryBuilder,
} from 'typeorm';
import { PaginationQueryDto } from '../dtos/pagination-query.dto';
import { Paginated } from '../interfaces/paginated.interface';

@Injectable()
export class PaginationProvider {
  public async paginateQuery<T extends ObjectLiteral>(
    paginationQueryDto: PaginationQueryDto,
    repository: Repository<T>,
    where: FindOptionsWhere<T> | FindOptionsWhere<T>[] = {},
    order: FindOptionsOrder<T> = {},
    relations?: string[],
    select?: (keyof T)[],
  ): Promise<Paginated<T>> {
    const page = paginationQueryDto.page ?? 1;
    const limit = Math.min(paginationQueryDto.limit ?? 10, 50);

    const findOptions: FindManyOptions<T> = {
      where,
      order,
      skip: (page - 1) * limit,
      take: limit,
    };

    if (relations) {
      findOptions.relations = relations;
    }

    if (select) {
      findOptions.select = select;
    }

    const [results, totalItems] = await repository.findAndCount(findOptions);

    let finalResponse = {
      data: results,
      meta: {
        itemsPerPage: limit,
        totalItems: totalItems,
        currentPage: page,
        totalPages: Math.ceil(totalItems / limit),
      },
    };

    return finalResponse;
  }

  public async paginateQueryBuilder<T extends ObjectLiteral>(
    paginationQueryDto: PaginationQueryDto,
    queryBuilder: SelectQueryBuilder<T>,
  ): Promise<Paginated<T>> {
    const page = paginationQueryDto.page ?? 1;
    const limit = Math.min(paginationQueryDto.limit ?? 10, 100);

    const cloneQueryBuilder = queryBuilder.clone();

    const totalItems = await cloneQueryBuilder.getCount();

    const results = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return {
      data: results,
      meta: {
        itemsPerPage: limit,
        totalItems: totalItems,
        currentPage: page,
        totalPages: Math.ceil(totalItems / limit),
      },
    };
  }
}
