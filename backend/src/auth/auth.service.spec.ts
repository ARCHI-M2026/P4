import { Test, TestingModule } from "@nestjs/testing";
import { UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { AuthService } from "./auth.service";
import { PrismaService } from "../_prisma/prisma.service";

describe("AuthService", () => {
  let service: AuthService;
  let prisma: {
    user: { findUnique: jest.Mock; create: jest.Mock };
  };
  let jwtService: { sign: jest.Mock };

  beforeEach(async () => {
    prisma = {
      user: {
        findUnique: jest.fn(),
        create: jest.fn(),
      },
    };
    jwtService = {
      sign: jest.fn().mockReturnValue("fake-jwt-token"),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    service = module.get(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("register", () => {
    it("crée un utilisateur avec un mot de passe correctement hashé", async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      prisma.user.create.mockImplementation(({ data }) =>
        Promise.resolve({ id: "user-1", ...data }),
      );

      const dto = { email: "test@example.com", password: "password123" };
      const result = await service.register(dto);

      expect(prisma.user.create).toHaveBeenCalledTimes(1);
      const [createArgs] = prisma.user.create.mock.calls[0] as [
        { data: { email: string; passwordHash: string } },
      ];

      // Le mot de passe stocké ne doit jamais être en clair.
      expect(createArgs.data.passwordHash).not.toBe(dto.password);

      // Le hash doit être vérifiable avec le mot de passe d'origine.
      const isValid = await bcrypt.compare(
        dto.password,
        createArgs.data.passwordHash,
      );
      expect(isValid).toBe(true);

      expect(result.email).toBe(dto.email);
    });

    it("rejette l'inscription si l'email existe déjà", async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: "existing-user",
        email: "test@example.com",
      });

      const dto = { email: "test@example.com", password: "password123" };

      await expect(service.register(dto)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(prisma.user.create).not.toHaveBeenCalled();
    });
  });

  describe("login", () => {
    it("retourne un access_token quand les identifiants sont valides", async () => {
      const passwordHash = await bcrypt.hash("password123", 10);
      prisma.user.findUnique.mockResolvedValue({
        id: "user-1",
        email: "test@example.com",
        passwordHash,
      });

      const dto = { email: "test@example.com", password: "password123" };
      const result = await service.login(dto);

      expect(result).toEqual({ access_token: "fake-jwt-token" });
      expect(jwtService.sign).toHaveBeenCalledWith({ id: "user-1" });
    });

    it("rejette la connexion si l'utilisateur n'existe pas", async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      const dto = { email: "inconnu@example.com", password: "password123" };

      await expect(service.login(dto)).rejects.toThrow(UnauthorizedException);
      expect(jwtService.sign).not.toHaveBeenCalled();
    });

    it("rejette la connexion si le mot de passe est incorrect", async () => {
      const passwordHash = await bcrypt.hash("bon-mot-de-passe", 10);
      prisma.user.findUnique.mockResolvedValue({
        id: "user-1",
        email: "test@example.com",
        passwordHash,
      });

      const dto = { email: "test@example.com", password: "mauvais-mot-de-passe" };

      await expect(service.login(dto)).rejects.toThrow(UnauthorizedException);
      expect(jwtService.sign).not.toHaveBeenCalled();
    });
  });
});