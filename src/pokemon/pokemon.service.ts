import { BadGatewayException, BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';
import { Pokemon } from './entities/pokemon.entity';
import { isValidObjectId, Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class PokemonService {

  constructor(
    @InjectModel(Pokemon.name)
    private readonly pokemonModel: Model<Pokemon>
  ) {}



  async create(createPokemonDto: CreatePokemonDto) {
    createPokemonDto.name = createPokemonDto.name.toLocaleLowerCase();

    try {
      const pokemon = await this.pokemonModel.create(createPokemonDto);
      return pokemon;
    } catch (error) {
      this.handleExceptions(error)
    }
  }

  findAll() {
    return `This action returns all pokemon`;
  }

  async findOne(term: string) {

    let pokemon: Pokemon;
    // no
    if (!isNaN(+term)) {
      pokemon = await this.pokemonModel.findOne({ no: term})
    }
    // MongoID
    if(!pokemon && isValidObjectId(term)) {
      pokemon = await this.pokemonModel.findById(term)
    }
    //Name
    if(!pokemon) {
      pokemon = await this.pokemonModel.findOne({name: term.toLocaleLowerCase().trim()})
    }

    if(!pokemon) throw new NotFoundException(`El pokemon con id, name o no, "${term}" no se encuentra`);

    return pokemon;
  }

  async update(term: string, updatePokemonDto: UpdatePokemonDto) {
    const pokemon = await this.findOne(term);
    if (updatePokemonDto.name)
      updatePokemonDto.name = updatePokemonDto.name.toLocaleLowerCase();

    try {
      await pokemon.updateOne(updatePokemonDto, {new: true}) //<-- regresa el valor actualizado
      return {...pokemon.toJSON(), ...updatePokemonDto};
    } catch (error) {
      this.handleExceptions(error)
    }
    
  }

  async remove(id: string) {
    //const pokemon = await this.findOne(id);
    // await pokemon.deleteOne();
    // return {id};

    // const result = await this.pokemonModel.findByIdAndDelete(id);
    //!deleteMany <-- es un delete * from !!!!!
    const result = await this.pokemonModel.deleteOne({_id: id}) // <-- esto hace una sola consulta

    if (result.deletedCount === 0) {
      throw new BadGatewayException(`El pokemon con id "${id}" no se encuentra`)
    }
    return;
  }


  private handleExceptions(error: any) {
    if (error.code === 11000) {
      throw new BadRequestException(`El pokemon ${JSON.stringify(error.keyValue)} ya existe en la bd`)
    }

    console.log(error);
    throw new InternalServerErrorException;
  }
}
