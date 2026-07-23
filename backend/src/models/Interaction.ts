import {DataTypes, Model} from 'sequelize';
import {sequelize} from '../config/database';
import {Position} from './Position';
import {CV} from './CV';

export class Comment extends Model {
    public id!: string;
    public positionId!: string;
    public authorName!: string;
    public content!: string;
    public createdAt!: Date;
}

Comment.init({
    id: {type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true},
    positionId: {type: DataTypes.UUID, allowNull: false, references: {model: Position, key: 'id'}},
    authorName: {type: DataTypes.STRING, allowNull: false, defaultValue: 'Анонимный кандидат'},
    content: {type: DataTypes.TEXT, allowNull: false}
}, {sequelize, modelName: 'Comment', updatedAt: false}); // Отключаем поле updatedAt, так как сообщения не редактируются по ТЗ

export class Like extends Model {
    public id!: string;
    public cvId!: string;
    public recruiterId!: string;
}

Like.init({
    id: {type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true},
    cvId: {type: DataTypes.UUID, allowNull: false, references: {model: CV, key: 'id'}},
    recruiterId: {type: DataTypes.UUID, allowNull: false}
}, {sequelize, modelName: 'Like'});

Position.hasMany(Comment, {foreignKey: 'positionId', as: 'comments', onDelete: 'CASCADE'});
Comment.belongsTo(Position, {foreignKey: 'positionId'});

CV.hasMany(Like, {foreignKey: 'cvId', as: 'likes', onDelete: 'CASCADE'});
Like.belongsTo(CV, {foreignKey: 'cvId'});