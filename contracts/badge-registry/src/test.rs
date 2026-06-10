#![cfg(test)]

use crate::contract::{BadgeRegistryContract, BadgeRegistryContractClient, BadgeType};
use soroban_sdk::testutils::Address as _;
use soroban_sdk::{Address, Env};

#[test]
fn test_issue_badge() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(BadgeRegistryContract, ());
    let client = BadgeRegistryContractClient::new(&env, &contract_id);

    let verifier = Address::generate(&env);
    let worker = Address::generate(&env);

    client.issue_badge(&verifier, &worker, &BadgeType::Cleaner);

    assert!(client.badge_issued(&worker, &BadgeType::Cleaner));
}

#[test]
fn test_revoke_badge() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(BadgeRegistryContract, ());
    let client = BadgeRegistryContractClient::new(&env, &contract_id);

    let verifier = Address::generate(&env);
    let worker = Address::generate(&env);

    client.issue_badge(&verifier, &worker, &BadgeType::Tutor);
    assert!(client.badge_issued(&worker, &BadgeType::Tutor));

    client.revoke_badge(&verifier, &worker, &BadgeType::Tutor);
    assert!(!client.badge_issued(&worker, &BadgeType::Tutor));
}

#[test]
fn test_get_worker_badges() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(BadgeRegistryContract, ());
    let client = BadgeRegistryContractClient::new(&env, &contract_id);

    let verifier = Address::generate(&env);
    let worker = Address::generate(&env);

    let badges = client.get_worker_badges(&worker);
    assert_eq!(badges.len(), 0);

    client.issue_badge(&verifier, &worker, &BadgeType::Cleaner);
    client.issue_badge(&verifier, &worker, &BadgeType::Tutor);
    client.issue_badge(&verifier, &worker, &BadgeType::Delivery);

    let badges = client.get_worker_badges(&worker);
    assert_eq!(badges.len(), 3);
}

#[test]
fn test_multiple_workers_independent() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(BadgeRegistryContract, ());
    let client = BadgeRegistryContractClient::new(&env, &contract_id);

    let verifier = Address::generate(&env);
    let worker_a = Address::generate(&env);
    let worker_b = Address::generate(&env);

    client.issue_badge(&verifier, &worker_a, &BadgeType::Cleaner);
    client.issue_badge(&verifier, &worker_a, &BadgeType::Tutor);
    client.issue_badge(&verifier, &worker_b, &BadgeType::Mover);

    assert_eq!(client.get_worker_badges(&worker_a).len(), 2);
    assert_eq!(client.get_worker_badges(&worker_b).len(), 1);
}

#[test]
#[should_panic]
fn test_double_issue_rejected() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(BadgeRegistryContract, ());
    let client = BadgeRegistryContractClient::new(&env, &contract_id);

    let verifier = Address::generate(&env);
    let worker = Address::generate(&env);

    client.issue_badge(&verifier, &worker, &BadgeType::Handyman);
    client.issue_badge(&verifier, &worker, &BadgeType::Handyman);
}

#[test]
#[should_panic]
fn test_revoke_unissued_badge_rejected() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(BadgeRegistryContract, ());
    let client = BadgeRegistryContractClient::new(&env, &contract_id);

    let verifier = Address::generate(&env);
    let worker = Address::generate(&env);

    client.revoke_badge(&verifier, &worker, &BadgeType::Photographer);
}

#[test]
fn test_revoke_updates_badge_list() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(BadgeRegistryContract, ());
    let client = BadgeRegistryContractClient::new(&env, &contract_id);

    let verifier = Address::generate(&env);
    let worker = Address::generate(&env);

    client.issue_badge(&verifier, &worker, &BadgeType::Cleaner);
    client.issue_badge(&verifier, &worker, &BadgeType::Tutor);
    client.issue_badge(&verifier, &worker, &BadgeType::Mover);
    assert_eq!(client.get_worker_badges(&worker).len(), 3);

    client.revoke_badge(&verifier, &worker, &BadgeType::Tutor);
    assert_eq!(client.get_worker_badges(&worker).len(), 2);
    assert!(client.badge_issued(&worker, &BadgeType::Cleaner));
    assert!(!client.badge_issued(&worker, &BadgeType::Tutor));
    assert!(client.badge_issued(&worker, &BadgeType::Mover));
}
