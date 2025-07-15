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
exports.getOfficeLocationById = exports.getOfficeLocationByLongitude = exports.getOfficeLocationByLatitude = exports.getOfficeLocationByName = exports.updateOfficeLocation = exports.createOfficeLocation = exports.getAllOfficeLocations = void 0;
const db_1 = __importDefault(require("../config/db"));
const getAllOfficeLocations = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const allOffices = yield db_1.default.officeLocation.findMany({
            where: {
                is_deleted: false,
            },
        });
        return allOffices;
    }
    catch (error) {
        throw new Error(`Failed to fetch all office locations: ${error.message}`);
    }
});
exports.getAllOfficeLocations = getAllOfficeLocations;
const createOfficeLocation = (officeLocation) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = {
            name: officeLocation.name,
            longitude: officeLocation.longitude,
            latitude: officeLocation.latitude,
            radius_meters: officeLocation.radius_meters,
        };
        if (officeLocation.address) {
            data["address"] = officeLocation.address;
        }
        const newOfficeLocation = yield db_1.default.officeLocation.create({
            data,
        });
        return newOfficeLocation;
    }
    catch (error) {
        throw new Error(`Failed to create a office location: ${error.message}`);
    }
});
exports.createOfficeLocation = createOfficeLocation;
const updateOfficeLocation = (officeLocation) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = {
            name: officeLocation.name,
            longitude: officeLocation.longitude,
            latitude: officeLocation.latitude,
            radius_meters: officeLocation.radius_meters,
        };
        if (officeLocation.address) {
            data["address"] = officeLocation.address;
        }
        const updatedOfficeLocation = yield db_1.default.officeLocation.update({
            data,
            where: {
                id: officeLocation.office_id,
            },
        });
        return updatedOfficeLocation;
    }
    catch (error) {
        throw new Error(`Failed to update a office location: ${error.message}`);
    }
});
exports.updateOfficeLocation = updateOfficeLocation;
const getOfficeLocationByName = (name) => __awaiter(void 0, void 0, void 0, function* () {
    return db_1.default.officeLocation.findUnique({
        where: { name: name.toLocaleLowerCase() },
    });
});
exports.getOfficeLocationByName = getOfficeLocationByName;
const getOfficeLocationByLatitude = (latitude) => __awaiter(void 0, void 0, void 0, function* () {
    return db_1.default.officeLocation.findUnique({
        where: { latitude: latitude },
    });
});
exports.getOfficeLocationByLatitude = getOfficeLocationByLatitude;
const getOfficeLocationByLongitude = (longitude) => __awaiter(void 0, void 0, void 0, function* () {
    return db_1.default.officeLocation.findUnique({
        where: { longitude: longitude },
    });
});
exports.getOfficeLocationByLongitude = getOfficeLocationByLongitude;
const getOfficeLocationById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    return db_1.default.officeLocation.findUnique({
        where: { id },
    });
});
exports.getOfficeLocationById = getOfficeLocationById;
