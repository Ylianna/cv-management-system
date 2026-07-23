import {DataTypes, Model} from 'sequelize';
import {sequelize} from '../config/database';
import {Profile} from './Profile';

export class AttributeLibrary extends Model {
    public id!: string;
    public category!: string;
    public name!: string;
    public description!: string;
    public type!: 'STRING' | 'TEXT' | 'IMAGE' | 'NUMERIC' | 'DATE' | 'PERIOD' | 'BOOLEAN' | 'DROPDOWN';
    public options!: string[] | null;
}

AttributeLibrary.init({
    id: {type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true},
    category: {type: DataTypes.STRING, allowNull: false},
    name: {type: DataTypes.STRING, allowNull: false, unique: true},
    description: {type: DataTypes.TEXT, allowNull: false},
    type: {type: DataTypes.STRING, allowNull: false},
    options: {type: DataTypes.JSONB, allowNull: true}
}, {sequelize, modelName: 'AttributeLibrary'});

export class ProfileAttributeValue extends Model {
    public id!: string;
    public profileId!: string;
    public attributeId!: string;
    public value!: string;
}

ProfileAttributeValue.init({
    id: {type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true},
    profileId: {type: DataTypes.UUID, allowNull: false, references: {model: Profile, key: 'id'}},
    attributeId: {type: DataTypes.UUID, allowNull: false, references: {model: AttributeLibrary, key: 'id'}},
    value: {type: DataTypes.TEXT, allowNull: false}
}, {sequelize, modelName: 'ProfileAttributeValue'});

Profile.hasMany(ProfileAttributeValue, {foreignKey: 'profileId', as: 'attributeValues', onDelete: 'CASCADE'});
ProfileAttributeValue.belongsTo(Profile, {foreignKey: 'profileId'});

AttributeLibrary.hasMany(ProfileAttributeValue, {foreignKey: 'attributeId', onDelete: 'CASCADE'});
ProfileAttributeValue.belongsTo(AttributeLibrary, {foreignKey: 'attributeId', as: 'attribute'});