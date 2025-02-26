import { CreateBusinessDto } from 'src/business/dtos/business.dto';
import { Business } from 'src/models/Business';

export interface IBusinessRepository {
  deleteById(id: number, tx?: any);
  create(data: CreateBusinessDto, userId: number, tx?: any);
  getbusinessbyId(businesId: number, tx?: any): Promise<Business>;
}
