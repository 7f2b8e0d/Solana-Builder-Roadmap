use anchor_lang::prelude::*;

declare_id!("5aGBXbYGppiv3F4TTtDn3pokarVUXTv5MoFkNbP4jsSJ");

#[program]
pub mod counter_program {
    use super::*;

    // 初始化计数器账户
    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        let counter = &mut ctx.accounts.counter;
        counter.count = 0;
        counter.authority = ctx.accounts.user.key();
        msg!("计数器初始化成功！初始值: {}", counter.count);
        Ok(())
    }

    // 增加计数器
    pub fn increment(ctx: Context<Increment>) -> Result<()> {
        let counter = &mut ctx.accounts.counter;
        counter.count += 1;
        msg!("计数器增加！当前值: {}", counter.count);
        Ok(())
    }

    // 减少计数器
    pub fn decrement(ctx: Context<Decrement>) -> Result<()> {
        let counter = &mut ctx.accounts.counter;
        counter.count -= 1;
        msg!("计数器减少！当前值: {}", counter.count);
        Ok(())
    }

    // 重置计数器（只有权限用户可以操作）
    pub fn reset(ctx: Context<Reset>) -> Result<()> {
        let counter = &mut ctx.accounts.counter;
        counter.count = 0;
        msg!("计数器重置！当前值: {}", counter.count);
        Ok(())
    }
}

// 计数器数据结构
#[account]
pub struct Counter {
    pub count: i64,        // 计数值
    pub authority: Pubkey, // 权限用户
}

// 初始化指令的账户结构
#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init,
        payer = user,
        space = 8 + 8 + 32, // discriminator + count + authority
        seeds = [b"counter"],
        bump
    )]
    pub counter: Account<'info, Counter>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

// 增加指令的账户结构
#[derive(Accounts)]
pub struct Increment<'info> {
    #[account(
        mut,
        seeds = [b"counter"],
        bump
    )]
    pub counter: Account<'info, Counter>,
}

// 减少指令的账户结构
#[derive(Accounts)]
pub struct Decrement<'info> {
    #[account(
        mut,
        seeds = [b"counter"],
        bump
    )]
    pub counter: Account<'info, Counter>,
}

// 重置指令的账户结构
#[derive(Accounts)]
pub struct Reset<'info> {
    #[account(
        mut,
        seeds = [b"counter"],
        bump,
        has_one = authority
    )]
    pub counter: Account<'info, Counter>,
    pub authority: Signer<'info>,
}
