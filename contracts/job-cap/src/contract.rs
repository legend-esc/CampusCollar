use soroban_sdk::{contract, contractimpl, Address, Env, IntoVal, Symbol, Val, Vec};

#[contract]
pub struct JobCapContract;

#[contractimpl]
impl JobCapContract {
    pub fn calculate_cap(env: Env, worker: Address, badge_registry: Address) -> i128 {
        let worker_val: Val = worker.into_val(&env);
        let mut args = Vec::new(&env);
        args.push_back(worker_val);
        let badges: Vec<Val> = env.invoke_contract(
            &badge_registry,
            &Symbol::new(&env, "get_worker_badges"),
            args,
        );
        let count = badges.len();
        match count {
            0 => 100,
            1 => 200,
            2 | 3 => 250,
            _ => 300,
        }
    }
}
