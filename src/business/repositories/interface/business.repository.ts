import { CreateBusinessDto } from 'src/business/dtos/business.dto';
import { Business } from 'src/business/entities/Business';

export interface IBusinessRepository {
  deleteById(id: number);
  create(data: CreateBusinessDto, userId: number);
  getbusinessbyId(businesId: number): Promise<Business>;
}
