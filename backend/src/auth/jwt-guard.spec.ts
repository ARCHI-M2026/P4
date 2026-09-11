import { Test, TestingModule } from "@nestjs/testing";
import { ExecutionContext, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { JwtAuthGuard } from "./jwt-guard";

describe("JwtAuthGuard", () => {
  let guard: JwtAuthGuard;
  let jwtService: { verifyAsync: jest.Mock };

  const createContext = (authorizationHeader?: string): ExecutionContext => {
    const request: { headers: Record<string, string>; user?: unknown } = {
      headers: authorizationHeader
        ? { authorization: authorizationHeader }
        : {},
    };

    return {
      switchToHttp: () => ({
        getRequest: () => request,
      }),
    } as unknown as ExecutionContext;
  };

  beforeEach(async () => {
    jwtService = {
      verifyAsync: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtAuthGuard,
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    guard = module.get(JwtAuthGuard);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("rejette quand aucun header Authorization n'est présent", async () => {
    const context = createContext();

    await expect(guard.canActivate(context)).rejects.toThrow(
      UnauthorizedException,
    );
    expect(jwtService.verifyAsync).not.toHaveBeenCalled();
  });

  it("rejette quand le header ne commence pas par 'Bearer'", async () => {
    const context = createContext("Basic some-credentials");

    await expect(guard.canActivate(context)).rejects.toThrow(
      UnauthorizedException,
    );
    expect(jwtService.verifyAsync).not.toHaveBeenCalled();
  });

  it("rejette quand le token est invalide ou expiré", async () => {
    jwtService.verifyAsync.mockRejectedValue(new Error("jwt expired"));
    const context = createContext("Bearer un-token-invalide");

    await expect(guard.canActivate(context)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it("autorise l'accès et injecte le payload dans request.user quand le token est valide", async () => {
    const payload = { id: "user-1" };
    jwtService.verifyAsync.mockResolvedValue(payload);
    const context = createContext("Bearer un-token-valide");

    const result = await guard.canActivate(context);

    expect(result).toBe(true);
    expect(jwtService.verifyAsync).toHaveBeenCalledWith("un-token-valide");

    const request = context.switchToHttp().getRequest<{ user: unknown }>();
    expect(request.user).toEqual(payload);
  });
});