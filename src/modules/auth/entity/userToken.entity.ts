import { TEXTAREA_MAX_LENGTH } from 'src/common/constants';
import { BaseEntity } from 'src/common/entities/BaseEntity';
import { User } from 'src/modules/user/entity/user.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { TokenType } from '../auth.constant';

@Entity('user_tokens')
export class UserToken extends BaseEntity {
    @Column()
    userId: number;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'userId' })
    user: User;

    @Column({ type: 'blob' })
    token: string;

    @Column({ type: 'enum', enum: TokenType, default: TokenType.REFRESH_TOKEN })
    type: TokenType;

    @Column({ type: 'varchar', length: TEXTAREA_MAX_LENGTH })
    hashToken: string;
}
