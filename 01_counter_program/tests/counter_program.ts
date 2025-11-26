import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { expect } from "chai";
import {
  SystemProgram,
  PublicKey,
  Keypair,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";

describe("counter-program", () => {
  anchor.setProvider(anchor.AnchorProvider.env());
  const provider = anchor.getProvider();
  const program = anchor.workspace.counterProgram as Program;
  const [counterPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("counter")],
    program.programId
  );

  before(async () => {
    await program.methods
      .initialize()
      .accounts({
        counter: counterPda,
        user: provider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();
  });

  beforeEach(async () => {
    await program.methods
      .reset()
      .accounts({
        counter: counterPda,
        authority: provider.wallet.publicKey,
      })
      .rpc();
  });

  it("初始化计数器并验证状态", async () => {
    const counterAccount = await (program.account as any).counter.fetch(counterPda);
    expect(counterAccount.count.toNumber()).to.equal(0);
    expect(counterAccount.authority.equals(provider.wallet.publicKey)).to.be.true;
  });

  it("increment 指令把计数加一", async () => {
    await program.methods.increment().accounts({ counter: counterPda }).rpc();
    const counterAccount = await (program.account as any).counter.fetch(counterPda);
    expect(counterAccount.count.toNumber()).to.equal(1);
  });

  it("decrement 指令把计数减一", async () => {
    await program.methods.decrement().accounts({ counter: counterPda }).rpc();
    const counterAccount = await (program.account as any).counter.fetch(counterPda);
    expect(counterAccount.count.toNumber()).to.equal(-1);
  });

  it("reset 指令将计数归零", async () => {
    await program.methods.increment().accounts({ counter: counterPda }).rpc();
    await program.methods.increment().accounts({ counter: counterPda }).rpc();

    await program.methods
      .reset()
      .accounts({
        counter: counterPda,
        authority: provider.wallet.publicKey,
      })
      .rpc();

    const counterAccount = await (program.account as any).counter.fetch(counterPda);
    expect(counterAccount.count.toNumber()).to.equal(0);
  });

  it("非授权账户调用 reset 会失败", async () => {
    const fakeAuthority = Keypair.generate();
    const sig = await provider.connection.requestAirdrop(
      fakeAuthority.publicKey,
      LAMPORTS_PER_SOL
    );
    await provider.connection.confirmTransaction(sig);

    let threw = false;
    try {
      await program.methods
        .reset()
        .accounts({
          counter: counterPda,
          authority: fakeAuthority.publicKey,
        })
        .signers([fakeAuthority])
        .rpc();
    } catch (err) {
      threw = true;
      expect((err as Error).message).to.include("ConstraintHasOne");
    }
    expect(threw).to.equal(true);
  });
});
