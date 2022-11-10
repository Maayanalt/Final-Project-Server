import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ItemsService } from 'src/items/items.service';
import { Repository } from 'typeorm';
import { CartDto } from './dto/cart.dto';
import { CartDetailsDto } from './dto/cartDetails.dto';
import { Cart } from './entities/cart.entity';
import { CartDetails } from './entities/cartDetails.entity';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart) private cartRepository: Repository<Cart>,
    @InjectRepository(CartDetails)
    private cartDetailsRepository: Repository<CartDetails>,
    private itemsService: ItemsService,
  ) {}

  createCart(cartDto: CartDto) {
    const cart = this.cartRepository.create(cartDto);
    return this.cartRepository.save(cart);
  }

  async itemAlreadyInCart(
    itemID: number,
    size: string,
    userID: number,
    modifiedDate: Date,
  ) {
    const itemCart = await this.findItem(itemID);
    if (itemCart && itemCart.size === size) {
      this.updateCartDetails(
        { itemID, quantity: itemCart.quantity + 1, size },
        userID,
        modifiedDate,
      );
      return true;
    }
    return false;
  }

  findItem(id: number) {
    return this.cartDetailsRepository.findOne({
      where: { item: { id } },
    });
  }

  async createCartDetails(
    cartDetailsDto: CartDetailsDto,
    userID: number,
    modifiedDate: Date,
  ) {
    const { itemID, quantity, size } = cartDetailsDto;
    if (this.itemAlreadyInCart(itemID, size, userID, modifiedDate)) return;
    let cart = await this.findOne(userID);
    if (!cart) cart = await this.createCart({ userID, modifiedDate });
    else this.updateCart(cart.id, modifiedDate);
    const item = await this.itemsService.findOne(itemID);
    const cartDetails = this.cartDetailsRepository.create({
      cart,
      item,
      size,
      quantity,
    });
    this.cartDetailsRepository.save(cartDetails);
  }

  findAll() {
    return this.cartRepository.find();
  }

  findOne(id: number) {
    return this.cartRepository.findOne({
      where: { user: { id } },
      relations: ['user'],
    });
  }

  async findCartDetails(id: number) {
    const cartItems = await this.cartDetailsRepository.find({
      where: { cart: { id } },
      relations: ['item'],
    });
    const newCartItems = [];
    for (const oneItem of cartItems) {
      const item = await this.itemsService.getOneItem(oneItem.item.id);
      const newItem = this.cartDetailsRepository.create({
        ...oneItem,
        item,
      });
      newCartItems.push(newItem);
    }
    return newCartItems;
  }

  updateCart(id: number, modifiedDate: Date) {
    this.cartRepository.update(id, { modifiedDate });
  }

  async updateCartDetails(
    cartDetailsDto: CartDetailsDto,
    userID: number,
    modifiedDate: Date,
  ) {
    const { itemID, quantity, size } = cartDetailsDto;
    const cart = await this.findOne(userID);
    this.updateCart(cart.id, modifiedDate);
    this.cartDetailsRepository.update(
      { item: { id: itemID }, cart },
      { quantity, size },
    );
  }

  async removeCartDetails(itemID: number, userID: number, modifiedDate: Date) {
    const cart = await this.findOne(userID);
    this.updateCart(cart.id, modifiedDate);
    return this.cartDetailsRepository.delete({ item: { id: itemID }, cart });
  }

  async removeCart(id: number) {
    return this.cartRepository.delete({ user: { id } });
  }
}
