import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { BaseModel } from '../../common/entities/base.entity';
import { UsersModel } from '../../users/entities/users.entity';
import { IsNumber, IsString } from 'class-validator';
import { ImageModel } from '../../common/entities/image.entity';

@Entity()
export class RampsModel extends BaseModel {
  @Column({ type: 'varchar', length: 20 })
  @IsString()
  district: string;

  @Column({ type: 'varchar', length: 20 })
  @IsString()
  type: string;

  @Column({ type: 'varchar', length: 45 })
  @IsString()
  address: string;

  @Column({ type: 'varchar', length: 20 })
  @IsString()
  tradeName: string;

  @Column('decimal', { precision: 10, scale: 2 })
  @IsNumber()
  width: number;

  @Column('double precision')
  @IsNumber()
  latitude: number;

  @Column('double precision')
  @IsNumber()
  longitude: number;

  @Column()
  @IsString()
  state: string;

  @ManyToOne(() => UsersModel, (user) => user.ramps, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  user: UsersModel;

  @OneToMany((type) => ImageModel, (image) => image.ramps)
  images: ImageModel[];
}
