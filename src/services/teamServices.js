"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTeamByName = exports.getTeamById = exports.deleteTeam = exports.updateTeam = exports.createTeam = exports.getAllTeams = void 0;
const db_1 = __importDefault(require("../config/db"));
const getAllTeams = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const allTeams = yield db_1.default.team.findMany({
            where: {
                is_deleted: false,
            },
        });
        return allTeams;
    }
    catch (error) {
        throw new Error(`Failed to fetch all Teams: ${error.message}`);
    }
});
exports.getAllTeams = getAllTeams;
const createTeam = (team) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = {
            name: team.name,
            team_lead_id: team.team_lead_id,
            department_id: team.department_id,
        };
        if (team.description)
            data.description = team.description;
        const newTeam = yield db_1.default.team.create({ data });
        return newTeam;
    }
    catch (error) {
        throw new Error(`Failed to create a team: ${error.message}`);
    }
});
exports.createTeam = createTeam;
const updateTeam = (team) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = {
            name: team.name,
            team_lead_id: team.team_lead_id,
            department_id: team.department_id,
        };
        if (team.description)
            data.description = team.description;
        const updatedTeam = yield db_1.default.team.update({
            where: {
                id: team.team_id,
            },
            data,
        });
        return updatedTeam;
    }
    catch (error) {
        throw new Error(`Failed to update a team: ${error.message}`);
    }
});
exports.updateTeam = updateTeam;
const deleteTeam = (id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const deletedTeam = yield db_1.default.team.update({
            where: { id },
            data: { is_deleted: true },
        });
        return deletedTeam;
    }
    catch (error) {
        throw new Error(`Failed to delete the team: ${error.message}`);
    }
});
exports.deleteTeam = deleteTeam;
const getTeamById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const team = yield db_1.default.team.findUnique({
            where: { id },
        });
        return team;
    }
    catch (error) {
        throw new Error(`Failed to fetch team by ID: ${error.message}`);
    }
});
exports.getTeamById = getTeamById;
const getTeamByName = (name) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const team = yield db_1.default.team.findUnique({
            where: { name: name.toLowerCase() },
        });
        return team;
    }
    catch (error) {
        throw new Error(`Failed to fetch team by name: ${error.message}`);
    }
});
exports.getTeamByName = getTeamByName;
