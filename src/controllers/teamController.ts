import { Request, Response } from "express";
import {
  createTeam,
  getAllTeams,
  getTeamById,
  getTeamByName,
  updateTeam,
} from "../services/teamServices";
import { handleAppError } from "../utils/appErrorHandler";
import {
  singleTeamSchema,
  teamSchema,
  teamUpdateSchema,
} from "../validations/teamValidations";

// Module --> Team
// Method --> GET (Protected)
// Endpoint --> /api/v1/teams
// Description --> Fetch all teams
export const getAllTeamsHandler = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const teams = await getAllTeams();

    return res.status(200).json({
      status: 1,
      message: "Teams fetched successfully",
      payload: teams,
    });
  } catch (error) {
    const err = handleAppError(error);
    return res.status(err.status).json({
      status: 0,
      message: err.message,
      payload: [],
    });
  }
};

// Module --> Teams
// Method --> POST (Protected)
// Endpoint --> /api/v1/teams/
// Description --> Create Team
export const createTeamHandler = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const parsedTeam = teamSchema.parse(req.body);

    const team = await getTeamByName(parsedTeam.name);
    if (team) {
      return res.status(400).json({
        status: 0,
        message: "Team with this name already exists",
        payload: [],
      });
    }

    const newTeam = await createTeam(parsedTeam);

    return res.status(201).json({
      status: 1,
      message: "Team created successfully",
      payload: [newTeam],
    });
  } catch (error) {
    const err = handleAppError(error);

    return res.status(err.status).json({
      success: 0,
      message: err.message,
      payload: [],
    });
  }
};

// Module --> Teams
// Method --> POST (Protected)
// Endpoint --> /api/v1/teams/single
// Description --> Get single team
export const getSingleTeamHandler = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const parsedData = singleTeamSchema.parse(req.body);

    const singleTeam = await getTeamById(parsedData.team_id);

    if (!singleTeam) {
      throw new Error("Team not found");
    }

    return res.status(200).json({
      status: 1,
      message: "Fetched single team successfully",
      payload: [singleTeam],
    });
  } catch (error) {
    const err = handleAppError(error);

    return res.status(err.status).json({
      success: 0,
      message: err.message,
      payload: [],
    });
  }
};

// Module --> Team
// Method --> PUT (Protected)
// Endpoint --> /api/v1/teams/
// Description --> Update team
export const updateTeamHandler = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const parsedData = teamUpdateSchema.parse(req.body);
    const updatedTeam = await updateTeam(parsedData);

    return res.status(200).json({
      status: 1,
      message: "Team updated successfully",
      payload: [updatedTeam],
    });
  } catch (error) {
    const err = handleAppError(error);

    return res.status(err.status).json({
      success: 0,
      message: err.message,
      payload: [],
    });
  }
};
