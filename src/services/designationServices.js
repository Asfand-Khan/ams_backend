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
exports.getDesignationById = exports.getDesignationByTitle = exports.updateDesignation = exports.createDesignation = exports.getAllDesignations = void 0;
const db_1 = __importDefault(require("../config/db"));
const getAllDesignations = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const allDesignations = yield db_1.default.designation.findMany({
            where: {
                is_deleted: false,
            },
        });
        return allDesignations;
    }
    catch (error) {
        throw new Error(`Failed to fetch all Designations: ${error.message}`);
    }
});
exports.getAllDesignations = getAllDesignations;
const createDesignation = (designation) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = {
            level: designation.level,
            title: designation.title,
        };
        if (designation.description) {
            data["description"] = designation.description;
        }
        if (designation.department_id) {
            data["department_id"] = designation.department_id;
        }
        const newDesignation = yield db_1.default.designation.create({
            data,
        });
        return newDesignation;
    }
    catch (error) {
        throw new Error(`Failed to create a designation: ${error.message}`);
    }
});
exports.createDesignation = createDesignation;
const updateDesignation = (designation) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = {
            level: designation.level,
            title: designation.title,
        };
        if (designation.description) {
            data["description"] = designation.description;
        }
        if (designation.department_id) {
            data["department_id"] = designation.department_id;
        }
        const updatedDesignation = yield db_1.default.designation.update({
            data,
            where: {
                id: designation.designation_id,
            },
        });
        return updatedDesignation;
    }
    catch (error) {
        throw new Error(`Failed to create a designation: ${error.message}`);
    }
});
exports.updateDesignation = updateDesignation;
const getDesignationByTitle = (title) => __awaiter(void 0, void 0, void 0, function* () {
    return db_1.default.designation.findUnique({
        where: { title: title.toLocaleLowerCase() },
    });
});
exports.getDesignationByTitle = getDesignationByTitle;
const getDesignationById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    return db_1.default.designation.findUnique({
        where: { id },
    });
});
exports.getDesignationById = getDesignationById;
