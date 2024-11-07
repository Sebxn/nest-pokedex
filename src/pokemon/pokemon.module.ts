import { Module } from '@nestjs/common';
import { PokemonService } from './pokemon.service';
import { PokemonController } from './pokemon.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Pokemon, PokemonSchema } from './entities/pokemon.entity';

@Module({
  controllers: [PokemonController],
  providers: [PokemonService],
  imports: [
    MongooseModule.forFeature([
      {
        name: Pokemon.name, // el name sale de la extension del Document y del atributo name de la calse Pokemon
        schema: PokemonSchema,
      }
    ])
  ],
  exports: [MongooseModule],
})
export class PokemonModule {}
