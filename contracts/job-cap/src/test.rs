#![cfg(test)]

use crate::contract::{JobCapContract, JobCapContractClient};
use soroban_sdk::testutils::Address as _;
use soroban_sdk::{Address, Env, Vec};

use soroban_sdk::contracttype;

#[contracttype]
#[derive(Clone, Debug, PartialEq)]
enum BadgeType {
    Cleaner,
    Tutor,
    Mover,
    Delivery,
    Handyman,
    EventStaff,
    TechSupport,
    Photographer,
}

mod test_badge_registry {
    use soroban_sdk::{contract, contractimpl, Address, Env, Vec};

    use super::BadgeType;

    #[contract]
    pub struct TestBadgeRegistry;

    #[contractimpl]
    impl TestBadgeRegistry {
        pub fn get_worker_badges(env: Env, worker: Address) -> Vec<BadgeType> {
            let key = (worker,);
            env.storage()
                .instance()
                .get(&key)
                .unwrap_or(Vec::new(&env))
        }

        pub fn set_worker_badges(env: Env, worker: Address, badges: Vec<BadgeType>) {
            let key = (worker,);
            env.storage().instance().set(&key, &badges);
        }
    }
}

fn setup(env: &Env, badges: &[BadgeType]) -> (Address, Vec<BadgeType>) {
    let worker = Address::generate(env);

    let mut badge_vec = Vec::new(env);
    for b in badges {
        badge_vec.push_back(b.clone());
    }

    (worker, badge_vec)
}

#[test]
fn test_cap_with_no_badges() {
    let env = Env::default();
    env.mock_all_auths();

    let badge_registry_id = env.register(test_badge_registry::TestBadgeRegistry, ());
    let badge_client =
        test_badge_registry::TestBadgeRegistryClient::new(&env, &badge_registry_id);

    let contract_id = env.register(JobCapContract, ());
    let client = JobCapContractClient::new(&env, &contract_id);

    let (worker, badge_vec) = setup(&env, &[]);
    badge_client.set_worker_badges(&worker, &badge_vec);

    let cap = client.calculate_cap(&worker, &badge_registry_id);
    assert_eq!(cap, 100);
}

#[test]
fn test_cap_with_one_badge() {
    let env = Env::default();
    env.mock_all_auths();

    let badge_registry_id = env.register(test_badge_registry::TestBadgeRegistry, ());
    let badge_client =
        test_badge_registry::TestBadgeRegistryClient::new(&env, &badge_registry_id);

    let contract_id = env.register(JobCapContract, ());
    let client = JobCapContractClient::new(&env, &contract_id);

    let (worker, badge_vec) = setup(&env, &[BadgeType::Cleaner]);
    badge_client.set_worker_badges(&worker, &badge_vec);

    let cap = client.calculate_cap(&worker, &badge_registry_id);
    assert_eq!(cap, 200);
}

#[test]
fn test_cap_with_two_badges() {
    let env = Env::default();
    env.mock_all_auths();

    let badge_registry_id = env.register(test_badge_registry::TestBadgeRegistry, ());
    let badge_client =
        test_badge_registry::TestBadgeRegistryClient::new(&env, &badge_registry_id);

    let contract_id = env.register(JobCapContract, ());
    let client = JobCapContractClient::new(&env, &contract_id);

    let (worker, badge_vec) = setup(&env, &[BadgeType::Cleaner, BadgeType::Tutor]);
    badge_client.set_worker_badges(&worker, &badge_vec);

    let cap = client.calculate_cap(&worker, &badge_registry_id);
    assert_eq!(cap, 250);
}

#[test]
fn test_cap_with_three_badges() {
    let env = Env::default();
    env.mock_all_auths();

    let badge_registry_id = env.register(test_badge_registry::TestBadgeRegistry, ());
    let badge_client =
        test_badge_registry::TestBadgeRegistryClient::new(&env, &badge_registry_id);

    let contract_id = env.register(JobCapContract, ());
    let client = JobCapContractClient::new(&env, &contract_id);

    let (worker, badge_vec) =
        setup(&env, &[BadgeType::Cleaner, BadgeType::Tutor, BadgeType::Mover]);
    badge_client.set_worker_badges(&worker, &badge_vec);

    let cap = client.calculate_cap(&worker, &badge_registry_id);
    assert_eq!(cap, 250);
}

#[test]
fn test_cap_with_five_badges() {
    let env = Env::default();
    env.mock_all_auths();

    let badge_registry_id = env.register(test_badge_registry::TestBadgeRegistry, ());
    let badge_client =
        test_badge_registry::TestBadgeRegistryClient::new(&env, &badge_registry_id);

    let contract_id = env.register(JobCapContract, ());
    let client = JobCapContractClient::new(&env, &contract_id);

    let (worker, badge_vec) = setup(
        &env,
        &[
            BadgeType::Cleaner,
            BadgeType::Tutor,
            BadgeType::Mover,
            BadgeType::Delivery,
            BadgeType::Handyman,
        ],
    );
    badge_client.set_worker_badges(&worker, &badge_vec);

    let cap = client.calculate_cap(&worker, &badge_registry_id);
    assert_eq!(cap, 300);
}

#[test]
fn test_cap_with_six_badges() {
    let env = Env::default();
    env.mock_all_auths();

    let badge_registry_id = env.register(test_badge_registry::TestBadgeRegistry, ());
    let badge_client =
        test_badge_registry::TestBadgeRegistryClient::new(&env, &badge_registry_id);

    let contract_id = env.register(JobCapContract, ());
    let client = JobCapContractClient::new(&env, &contract_id);

    let (worker, badge_vec) = setup(
        &env,
        &[
            BadgeType::Cleaner,
            BadgeType::Tutor,
            BadgeType::Mover,
            BadgeType::Delivery,
            BadgeType::Handyman,
            BadgeType::EventStaff,
        ],
    );
    badge_client.set_worker_badges(&worker, &badge_vec);

    let cap = client.calculate_cap(&worker, &badge_registry_id);
    assert_eq!(cap, 300);
}
