import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';
import { AttributeLibrary } from './Attribute';

export class Position extends Model {
    public id!: string;
    public title!: string;
    public description!: string;
    public accessRules!: any;
    public maxProjects!: number;
    public version!: number;
}

Position.init({
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    title: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: false },
    accessRules: { type: DataTypes.JSONB, allowNull: false, defaultValue: [] },
    maxProjects: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 3 }
}, {
    sequelize,
    modelName: 'Position',
    version: true
});

export class PositionAttribute extends Model {
    public id!: string;
    public positionId!: string;
    public attributeId!: string;
    public isRequired!: boolean;
}

PositionAttribute.init({
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    positionId: { type: DataTypes.UUID, allowNull: false, references: { model: Position, key: 'id' } },
    attributeId: { type: DataTypes.UUID, allowNull: false, references: { model: AttributeLibrary, key: 'id' } },
    isRequired: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false }
}, { sequelize, modelName: 'PositionAttribute' });

Position.belongsToMany(AttributeLibrary, { through: PositionAttribute, as: 'requiredAttributes', foreignKey: 'positionId' });
AttributeLibrary.belongsToMany(Position, { through: PositionAttribute, foreignKey: 'attributeId' });