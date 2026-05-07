const { assertCpf, assertEmail, assertMoney } = require("../utils/validators");

describe("validadores", () => {
  test("aceita CPF valido com mascara e sem mascara", () => {
    expect(assertCpf("529.982.247-25")).toBe("52998224725");
    expect(assertCpf("52998224725")).toBe("52998224725");
  });

  test("rejeita CPF invalido", () => {
    expect(() => assertCpf("111.111.111-11")).toThrow("CPF invalido");
    expect(() => assertCpf("123.456.789-00")).toThrow("CPF invalido");
  });

  test("valida email em formato padrao e sem caracteres perigosos", () => {
    expect(assertEmail("Pessoa@Email.com")).toBe("pessoa@email.com");
    expect(() => assertEmail("pessoa@email")).toThrow("Email invalido");
    expect(() => assertEmail("a@b.com<script>")).toThrow("Email invalido");
  });

  test("valida valores monetarios permitidos", () => {
    expect(assertMoney("0,01")).toBe(1);
    expect(assertMoney(1000000)).toBe(100000000);
    expect(() => assertMoney(0)).toThrow("Valor deve estar");
    expect(() => assertMoney(1000000.01)).toThrow("Valor deve estar");
  });
});
