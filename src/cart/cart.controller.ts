import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Session,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { AuthGuard } from 'src/auth/auth.guard';
import { CartValidatorPipe } from 'src/pipes/cart-validator.pipe';
import { CartService } from './cart.service';
import { CreateCartDetailsDto } from './dto/createCartDetails.dto';
import { UpdateCartDetailsDto } from './dto/updateCartDetails.dto';

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post()
  @UseGuards(AuthGuard)
  @UsePipes(CartValidatorPipe)
  create(
    @Body() cartDetailsDto: CreateCartDetailsDto,
    @Session() session: Record<string, any>,
  ) {
    const date = new Date();
    return this.cartService.createCartDetails(
      cartDetailsDto,
      session.userID,
      date,
    );
  }

  @Get()
  @UseGuards(AuthGuard)
  async getCart(@Session() session: Record<string, any>) {
    const userID = session.userID;
    const cart = await this.cartService.findOne(userID);
    if (cart) {
      const { id } = cart;
      return this.cartService.findCartDetails(id);
    }
    return [];
  }

  @Patch('update')
  @UseGuards(AuthGuard)
  async update(
    @Body() cartDetailsDto: UpdateCartDetailsDto,
    @Session() session: Record<string, any>,
  ) {
    const date = new Date();
    this.cartService.updateCartDetails(cartDetailsDto, session.userID, date);
  }

  @Patch('update/duplicates')
  @UseGuards(AuthGuard)
  async updateDuplicates(
    @Body() cartDetailsDto: UpdateCartDetailsDto,
    @Session() session: Record<string, any>,
  ) {
    const date = new Date();
    this.cartService.duplicatesInCart(cartDetailsDto, session.userID, date);
  }

  @Delete(':cartDetailID')
  @UseGuards(AuthGuard)
  remove(
    @Param('cartDetailID') cartDetailID: string,
    @Session() session: Record<string, any>,
  ) {
    const date = new Date();
    return this.cartService.removeCartDetails(
      +cartDetailID,
      session.userID,
      date,
    );
  }

  @Delete()
  @UseGuards(AuthGuard)
  removeCart(@Session() session: Record<string, any>) {
    return this.cartService.removeCart(session.userID);
  }
}
