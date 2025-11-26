/**
 * 🌐 Counter Program 客户端交互示例
 * 
 * 这个文件展示如何在前端JavaScript中与我们的计数器程序交互
 */

const anchor = require("@coral-xyz/anchor");
const { Connection, PublicKey, clusterApiUrl } = require("@solana/web3.js");

// 程序配置
const PROGRAM_ID = new PublicKey("5aGBXbYGppiv3F4TTtDn3pokarVUXTv5MoFkNbP4jsSJ");
const NETWORK = clusterApiUrl("devnet"); // 或 "mainnet-beta", "testnet"

class CounterClient {
    constructor(wallet) {
        // 创建连接
        this.connection = new Connection(NETWORK, "confirmed");
        
        // 设置提供者
        this.provider = new anchor.AnchorProvider(
            this.connection,
            wallet,
            { commitment: "confirmed" }
        );
        
        // 设置程序
        anchor.setProvider(this.provider);
        
        // 计算PDA地址
        this.counterPDA = PublicKey.findProgramAddressSync(
            [Buffer.from("counter")],
            PROGRAM_ID
        )[0];
        
        console.log("🔧 客户端初始化完成");
        console.log("📍 计数器PDA:", this.counterPDA.toString());
    }

    /**
     * 初始化计数器
     */
    async initialize() {
        try {
            console.log("🚀 初始化计数器...");
            
            const tx = await this.program.methods
                .initialize()
                .accounts({
                    counter: this.counterPDA,
                    user: this.provider.wallet.publicKey,
                    systemProgram: anchor.web3.SystemProgram.programId,
                })
                .rpc();

            console.log("✅ 初始化成功！交易签名:", tx);
            return tx;
        } catch (error) {
            console.error("❌ 初始化失败:", error.message);
            throw error;
        }
    }

    /**
     * 增加计数器
     */
    async increment() {
        try {
            console.log("🔼 增加计数器...");
            
            const tx = await this.program.methods
                .increment()
                .accounts({
                    counter: this.counterPDA,
                })
                .rpc();

            console.log("✅ 增加成功！交易签名:", tx);
            return tx;
        } catch (error) {
            console.error("❌ 增加失败:", error.message);
            throw error;
        }
    }

    /**
     * 减少计数器
     */
    async decrement() {
        try {
            console.log("🔽 减少计数器...");
            
            const tx = await this.program.methods
                .decrement()
                .accounts({
                    counter: this.counterPDA,
                })
                .rpc();

            console.log("✅ 减少成功！交易签名:", tx);
            return tx;
        } catch (error) {
            console.error("❌ 减少失败:", error.message);
            throw error;
        }
    }

    /**
     * 重置计数器
     */
    async reset() {
        try {
            console.log("🔄 重置计数器...");
            
            const tx = await this.program.methods
                .reset()
                .accounts({
                    counter: this.counterPDA,
                    authority: this.provider.wallet.publicKey,
                })
                .rpc();

            console.log("✅ 重置成功！交易签名:", tx);
            return tx;
        } catch (error) {
            console.error("❌ 重置失败:", error.message);
            throw error;
        }
    }

    /**
     * 获取计数器当前值
     */
    async getCount() {
        try {
            const counterAccount = await this.program.account.counter.fetch(this.counterPDA);
            const count = counterAccount.count.toNumber();
            const authority = counterAccount.authority.toString();
            
            console.log("📊 当前计数器状态:");
            console.log("   计数值:", count);
            console.log("   权限用户:", authority);
            
            return { count, authority };
        } catch (error) {
            console.error("❌ 获取计数器失败:", error.message);
            throw error;
        }
    }

    /**
     * 监听计数器变化
     */
    async watchCounter(callback) {
        console.log("👀 开始监听计数器变化...");
        
        const subscriptionId = this.connection.onAccountChange(
            this.counterPDA,
            (accountInfo) => {
                try {
                    // 解析账户数据
                    const counterData = this.program.coder.accounts.decode(
                        "counter",
                        accountInfo.data
                    );
                    
                    const count = counterData.count.toNumber();
                    console.log("🔔 计数器更新:", count);
                    
                    if (callback) {
                        callback(count);
                    }
                } catch (error) {
                    console.error("❌ 解析账户数据失败:", error);
                }
            },
            "confirmed"
        );

        return subscriptionId;
    }

    /**
     * 停止监听
     */
    async stopWatching(subscriptionId) {
        await this.connection.removeAccountChangeListener(subscriptionId);
        console.log("🛑 停止监听计数器变化");
    }
}

// 使用示例
async function example() {
    try {
        // 注意：在实际应用中，你需要连接真实的钱包
        // 这里只是示例代码结构
        console.log("📚 Counter Program 客户端使用示例");
        console.log("⚠️  注意：这是示例代码，需要真实钱包才能运行");
        
        /*
        // 实际使用时的代码示例：
        
        // 1. 创建客户端
        const wallet = new anchor.Wallet(keypair); // 你的钱包
        const client = new CounterClient(wallet);
        
        // 2. 初始化计数器
        await client.initialize();
        
        // 3. 操作计数器
        await client.increment();
        await client.increment();
        await client.decrement();
        
        // 4. 查看状态
        const { count } = await client.getCount();
        console.log("最终计数:", count);
        
        // 5. 监听变化
        const subscriptionId = await client.watchCounter((newCount) => {
            console.log("计数器变为:", newCount);
        });
        
        // 6. 停止监听
        setTimeout(async () => {
            await client.stopWatching(subscriptionId);
        }, 30000);
        */
        
    } catch (error) {
        console.error("示例运行失败:", error);
    }
}

// 导出类和示例函数
module.exports = {
    CounterClient,
    example
};

// 如果直接运行此文件
if (require.main === module) {
    example();
}
