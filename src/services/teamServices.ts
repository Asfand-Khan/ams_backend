import prisma from "../config/db";
import { Team, TeamUpdate } from "../validations/teamValidations";

export const getAllTeams = async (user: any) => {
  const userRecord = await prisma.user.findFirst({
    where: { employee_id: user.id },
    select: { type: true },
  });

  if (!userRecord) {
    throw new Error("User not found");
  }

  const userType = userRecord.type;

  if (userType === "employee") {
    return [];
  }

  let whereClause: any = {
    is_deleted: false,
  };
  if (userType === "lead") {
    whereClause.team_lead_id = user.id;
  }
  const allTeams = await prisma.team.findMany({
    where: whereClause,
    select: {
      id: true,
      name: true,
      description: true,
      team_lead_id: true,
      department_id: true,
      is_active: true,
      is_deleted: true,
      created_at: true,
      updated_at: true,
    },
    orderBy: { created_at: "desc" },
  });

  return allTeams.map((team) => ({
    id: Number(team.id),
    name: team.name,
    description: team.description,
    team_lead_id: team.team_lead_id ? Number(team.team_lead_id) : null,
    department_id: team.department_id ? Number(team.department_id) : null,
    is_active: team.is_active,
    is_deleted: team.is_deleted,
    created_at: team.created_at.toISOString(),
    updated_at: team.updated_at.toISOString(),
  }));
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