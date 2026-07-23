import {DataTypes, Model} from 'sequelize';
import {sequelize} from '../config/database';
import {Profile} from './Profile';
import {Position} from './Position';

export class CV extends Model {
    public id!: string;
    public profileId!: string;
    public positionId!: string;
    public isPublished!: boolean;
    public version!: number;
}

CV.init({
    id: {type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true},
    profileId: {type: DataTypes.UUID, allowNull: false, references: {model: Profile, key: 'id'}},
    positionId: {type: DataTypes.UUID, allowNull: false, references: {model: Position, key: 'id'}},
    isPublished: {type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false}
}, {
    sequelize,
    modelName: 'CV',
    version: true
});

Profile.hasMany(CV, {foreignKey: 'profileId', onDelete: 'CASCADE'});
CV.belongsTo(Profile, {foreignKey: 'profileId'});

Position.hasMany(CV, {foreignKey: 'positionId', onDelete: 'CASCADE'});
CV.belongsTo(Position, {foreignKey: 'positionId'});