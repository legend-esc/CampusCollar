#![cfg(test)]

use crate::contract::{EscrowContract, EscrowContractClient, JobStatus};
use soroban_sdk::testutils::{Address as _, Ledger};
use soroban_sdk::{Address, BytesN, Env};

#[test]
fn test_create_job() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(EscrowContract, ());
    let client = EscrowContractClient::new(&env, &contract_id);

    let customer = Address::generate(&env);
    let deadline = env.ledger().timestamp() + 3600;

    let job_id = client.create_job(&customer, &1_000_000, &deadline);
    let status = client.get_job_status(&job_id);

    assert_eq!(status, JobStatus::Created);
}

#[test]
fn test_happy_path() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(EscrowContract, ());
    let client = EscrowContractClient::new(&env, &contract_id);

    let customer = Address::generate(&env);
    let worker = Address::generate(&env);
    let deadline = env.ledger().timestamp() + 3600;

    let job_id = client.create_job(&customer, &1_000_000, &deadline);
    assert_eq!(client.get_job_status(&job_id), JobStatus::Created);

    client.fund_job(&job_id, &customer);
    assert_eq!(client.get_job_status(&job_id), JobStatus::Funded);

    client.accept_job(&job_id, &worker);
    assert_eq!(client.get_job_status(&job_id), JobStatus::Accepted);

    let challenge = BytesN::from_array(&env, &[0x01u8; 32]);
    client.store_nfc_challenge(&job_id, &challenge, &customer);

    client.release_payment(&job_id, &challenge);
    assert_eq!(client.get_job_status(&job_id), JobStatus::Paid);
}

#[test]
#[should_panic]
fn test_double_accept_rejected() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(EscrowContract, ());
    let client = EscrowContractClient::new(&env, &contract_id);

    let customer = Address::generate(&env);
    let worker1 = Address::generate(&env);
    let worker2 = Address::generate(&env);
    let deadline = env.ledger().timestamp() + 3600;

    let job_id = client.create_job(&customer, &1_000_000, &deadline);
    client.fund_job(&job_id, &customer);
    client.accept_job(&job_id, &worker1);
    client.accept_job(&job_id, &worker2);
}

#[test]
fn test_dispute_and_resolve() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(EscrowContract, ());
    let client = EscrowContractClient::new(&env, &contract_id);

    let customer = Address::generate(&env);
    let worker = Address::generate(&env);
    let deadline = env.ledger().timestamp() + 3600;

    let job_id = client.create_job(&customer, &1_000_000, &deadline);
    client.fund_job(&job_id, &customer);
    client.accept_job(&job_id, &worker);

    client.dispute(&job_id, &customer);
    assert_eq!(client.get_job_status(&job_id), JobStatus::Disputed);

    client.resolve_dispute(&job_id, &worker);
    assert_eq!(client.get_job_status(&job_id), JobStatus::Resolved);
}

#[test]
fn test_cancel_by_customer_before_acceptance() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(EscrowContract, ());
    let client = EscrowContractClient::new(&env, &contract_id);

    let customer = Address::generate(&env);
    let deadline = env.ledger().timestamp() + 3600;

    let job_id = client.create_job(&customer, &1_000_000, &deadline);
    client.cancel_job(&job_id, &customer);
    assert_eq!(client.get_job_status(&job_id), JobStatus::Cancelled);
}

#[test]
fn test_cancel_by_worker_after_acceptance() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(EscrowContract, ());
    let client = EscrowContractClient::new(&env, &contract_id);

    let customer = Address::generate(&env);
    let worker = Address::generate(&env);
    let deadline = env.ledger().timestamp() + 3600;

    let job_id = client.create_job(&customer, &1_000_000, &deadline);
    client.fund_job(&job_id, &customer);
    client.accept_job(&job_id, &worker);

    client.cancel_job(&job_id, &worker);
    assert_eq!(client.get_job_status(&job_id), JobStatus::Cancelled);
}

#[test]
#[should_panic]
fn test_customer_cannot_cancel_after_acceptance() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(EscrowContract, ());
    let client = EscrowContractClient::new(&env, &contract_id);

    let customer = Address::generate(&env);
    let worker = Address::generate(&env);
    let deadline = env.ledger().timestamp() + 3600;

    let job_id = client.create_job(&customer, &1_000_000, &deadline);
    client.fund_job(&job_id, &customer);
    client.accept_job(&job_id, &worker);

    client.cancel_job(&job_id, &customer);
}

#[test]
fn test_expire_job_after_deadline() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(EscrowContract, ());
    let client = EscrowContractClient::new(&env, &contract_id);

    let customer = Address::generate(&env);
    let deadline = env.ledger().timestamp();

    let job_id = client.create_job(&customer, &1_000_000, &deadline);

    env.ledger().set_timestamp(deadline + 1);

    client.expire_job(&job_id);
    assert_eq!(client.get_job_status(&job_id), JobStatus::Expired);
}

#[test]
#[should_panic]
fn test_expire_before_deadline_rejected() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(EscrowContract, ());
    let client = EscrowContractClient::new(&env, &contract_id);

    let customer = Address::generate(&env);
    let deadline = env.ledger().timestamp() + 3600;

    let job_id = client.create_job(&customer, &1_000_000, &deadline);

    client.expire_job(&job_id);
}

#[test]
#[should_panic]
fn test_release_with_invalid_challenge_rejected() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(EscrowContract, ());
    let client = EscrowContractClient::new(&env, &contract_id);

    let customer = Address::generate(&env);
    let worker = Address::generate(&env);
    let deadline = env.ledger().timestamp() + 3600;

    let job_id = client.create_job(&customer, &1_000_000, &deadline);
    client.fund_job(&job_id, &customer);
    client.accept_job(&job_id, &worker);

    let valid_challenge = BytesN::from_array(&env, &[0x01u8; 32]);
    client.store_nfc_challenge(&job_id, &valid_challenge, &customer);

    let wrong_challenge = BytesN::from_array(&env, &[0x02u8; 32]);
    client.release_payment(&job_id, &wrong_challenge);
}

#[test]
fn test_nfc_challenge_single_use() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(EscrowContract, ());
    let client = EscrowContractClient::new(&env, &contract_id);

    let customer = Address::generate(&env);
    let worker = Address::generate(&env);
    let deadline = env.ledger().timestamp() + 3600;

    let job_id = client.create_job(&customer, &1_000_000, &deadline);
    client.fund_job(&job_id, &customer);
    client.accept_job(&job_id, &worker);

    let challenge = BytesN::from_array(&env, &[0x01u8; 32]);
    client.store_nfc_challenge(&job_id, &challenge, &customer);
    client.release_payment(&job_id, &challenge);
    assert_eq!(client.get_job_status(&job_id), JobStatus::Paid);
}

#[test]
fn test_create_multiple_jobs_unique_ids() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(EscrowContract, ());
    let client = EscrowContractClient::new(&env, &contract_id);

    let customer = Address::generate(&env);
    let deadline = env.ledger().timestamp() + 3600;

    let job_id_1 = client.create_job(&customer, &1_000_000, &deadline);
    let job_id_2 = client.create_job(&customer, &500_000, &deadline);

    assert_ne!(job_id_1, job_id_2);
    assert_eq!(client.get_job_status(&job_id_1), JobStatus::Created);
    assert_eq!(client.get_job_status(&job_id_2), JobStatus::Created);
}
