import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';

export class Profile extends Model {
    public id!: string;
    public firstName!: string;
    public lastName!: string;
    public location!: string;
    public photoUrl!: string;
    public version!: number;
}

Profile.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    firstName: { type: DataTypes.STRING, allowNull: false },
    lastName: { type: DataTypes.STRING, allowNull: false },
    location: { type: DataTypes.STRING, allowNull: false },
    photoUrl: { type: DataTypes.STRING, allowNull: false }
}, {
    sequelize,
    modelName: 'Profile',
    version: true
});