import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';
import { Profile } from './Profile';

export class Project extends Model {
    public id!: string;
    public profileId!: string;
    public name!: string;
    public startDate!: Date;
    public endDate!: Date;
    public description!: string;
    public tags!: string[];
}

Project.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    profileId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: Profile, key: 'id' }
    },
    name: { type: DataTypes.STRING, allowNull: false },
    startDate: { type: DataTypes.DATE, allowNull: false },
    endDate: { type: DataTypes.DATE, allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: false },
    tags: {
        type: DataTypes.JSONB,
        allowNull: false,
        defaultValue: []
    }
}, {
    sequelize,
    modelName: 'Project'
});

Profile.hasMany(Project, { foreignKey: 'profileId', as: 'projects', onDelete: 'CASCADE' });
Project.belongsTo(Profile, { foreignKey: 'profileId' });