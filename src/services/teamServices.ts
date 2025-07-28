import prisma from "../config/db";
import { Team, TeamUpdate } from "../validations/teamValidations";

export const getAllTeams = async () => {
  const allTeams = await prisma.team.findMany({
    where: {
      is_deleted: false,
    },
  });
  return allTeams;
};

export const createTeam = async (team: Team) => {
  const data: any = {
    name: team.name,
    department_id: team.department_id,
  };

  if (team.description) data.description = team.description;
  if (team.team_lead_id) data.team_lead_id = team.team_lead_id;

  const newTeam = await prisma.team.create({ data });
  return newTeam;
};

export const updateTeam = async (team: TeamUpdate) => {
  const data: any = {
    name: team.name,
    department_id: team.department_id,
  };

  if (team.description) data.description = team.description;
  if (team.team_lead_id) data.team_lead_id = team.team_lead_id;

  const updatedTeam = await prisma.team.update({
    where: {
      id: team.team_id,
    },
    data,
  });

  return updatedTeam;
};

export const deleteTeam = async (id: number) => {
  const deletedTeam = await prisma.team.update({
    where: { id },
    data: { is_deleted: true },
  });
  return deletedTeam;
};

export const getTeamById = async (id: number) => {
  const team = await prisma.team.findUnique({
    where: { id },
  });
  return team;
};

export const getTeamByName = async (name: string) => {
  const team = await prisma.team.findUnique({
    where: { name: name.toLowerCase() },
  });
  return team;
};