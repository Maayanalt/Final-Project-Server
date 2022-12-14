import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Categories } from './entities/categories.entity';
import { Items } from './entities/items.entity';
import { ItemDetails } from './entities/itemDetails.entity';
import { Photos } from './entities/photos.entity';

@Injectable()
export class ItemsService {
  constructor(
    @InjectRepository(Items) private itemsRepository: Repository<Items>,
    @InjectRepository(Photos) private photoRepository: Repository<Photos>,
    @InjectRepository(ItemDetails)
    private detailsRepository: Repository<ItemDetails>,
    @InjectRepository(Categories)
    private categoriesRepository: Repository<Categories>,
  ) {}

  async getAll(): Promise<Items[]> {
    const items = await this.itemsRepository.find();
    const newItems = [];
    for (const item of items) {
      const images = await this.photoRepository.find({
        where: { item: { id: item.id } },
        select: ['src', 'alt'],
      });
      const sizes = await this.detailsRepository.find({
        where: { item: { id: item.id } },
        select: ['size', 'unitsInStock'],
      });
      const newItem = this.itemsRepository.create({
        ...item,
        images,
        sizes,
      });
      newItems.push(newItem);
    }
    return newItems;
  }

  async getOneItem(id: number): Promise<Items> {
    const item = await this.itemsRepository.findOne({ id });
    const images = await this.photoRepository.find({
      where: { item: { id } },
      select: ['src', 'alt'],
    });
    const sizes = await this.detailsRepository.find({
      where: { item: { id } },
      select: ['size', 'unitsInStock'],
    });
    const newItem = this.itemsRepository.create({
      ...item,
      images,
      sizes,
    });

    return newItem;
  }

  getCategories(): Promise<Categories[]> {
    return this.categoriesRepository.find({
      where: { parentCategory: null },
      relations: ['childCategories'],
    });
  }

  findOne(id: number): Promise<Items> {
    return this.itemsRepository.findOne(id);
  }

  async getItemsByCategory(categoryID: number): Promise<Items[]> {
    const newItems = [];
    const items = await this.itemsRepository.find({
      where: { category: { id: categoryID } },
    });
    for (const item of items) {
      const newItem = await this.getOneItem(item.id);
      newItems.push(newItem);
    }

    return newItems;
  }

  async getItemsByParentCategory(categoryID: number): Promise<Items[]> {
    const newItems = [];
    const items = await this.itemsRepository.find({
      where: { category: { parentCategory: { id: categoryID } } },
      relations: ['category'],
    });
    for (const item of items) {
      const newItem = await this.getOneItem(item.id);
      newItems.push(newItem);
    }

    return newItems;
  }
}
