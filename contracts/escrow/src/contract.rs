use soroban_sdk::{
    contract, contractimpl, contracttype, symbol_short, Address, Bytes, BytesN, Env, Symbol,
};

const COUNTER_KEY: Symbol = symbol_short!("counter");

#[contracttype]
#[derive(Clone, Debug, PartialEq)]
pub enum JobStatus {
    Created,
    Funded,
    Accepted,
    Paid,
    Disputed,
    Resolved,
    Cancelled,
    Expired,
}

#[contracttype]
#[derive(Clone)]
pub struct Job {
    pub customer: Address,
    pub worker: Option<Address>,
    pub amount: i128,
    pub deadline: u64,
    pub status: JobStatus,
    pub nfc_counter: u32,
    pub dispute_winner: Option<Address>,
}

#[contracttype]
pub enum DataKey {
    Job(BytesN<32>),
    NfcChallenge(BytesN<32>),
}

fn read_job(env: &Env, job_id: &BytesN<32>) -> Job {
    env.storage()
        .instance()
        .get(&DataKey::Job(job_id.clone()))
        .expect("job not found")
}

fn write_job(env: &Env, job_id: &BytesN<32>, job: &Job) {
    env.storage()
        .instance()
        .set(&DataKey::Job(job_id.clone()), job);
}

fn read_challenge(env: &Env, job_id: &BytesN<32>) -> Option<BytesN<32>> {
    env.storage()
        .instance()
        .get(&DataKey::NfcChallenge(job_id.clone()))
}

fn write_challenge(env: &Env, job_id: &BytesN<32>, challenge: &BytesN<32>) {
    env.storage()
        .instance()
        .set(&DataKey::NfcChallenge(job_id.clone()), challenge);
}

fn remove_challenge(env: &Env, job_id: &BytesN<32>) {
    env.storage()
        .instance()
        .remove(&DataKey::NfcChallenge(job_id.clone()));
}

#[contract]
pub struct EscrowContract;

#[contractimpl]
impl EscrowContract {
    pub fn create_job(env: Env, customer: Address, amount: i128, deadline: u64) -> BytesN<32> {
        customer.require_auth();

        let counter: u64 = env
            .storage()
            .instance()
            .get(&COUNTER_KEY)
            .unwrap_or(0);
        env.storage()
            .instance()
            .set(&COUNTER_KEY, &(counter + 1));

        let counter_be = counter.to_be_bytes();
        let hash = env.crypto().sha256(&Bytes::from_slice(&env, &counter_be));
        let job_id: BytesN<32> = hash.into();

        let job = Job {
            customer,
            worker: None,
            amount,
            deadline,
            status: JobStatus::Created,
            nfc_counter: 0,
            dispute_winner: None,
        };

        write_job(&env, &job_id, &job);

        job_id
    }

    pub fn fund_job(env: Env, job_id: BytesN<32>, from: Address) {
        from.require_auth();

        let mut job = read_job(&env, &job_id);
        if job.status != JobStatus::Created {
            panic!("job must be in Created status to fund");
        }

        job.status = JobStatus::Funded;
        write_job(&env, &job_id, &job);
    }

    pub fn accept_job(env: Env, job_id: BytesN<32>, worker: Address) {
        worker.require_auth();

        let mut job = read_job(&env, &job_id);
        if job.status != JobStatus::Funded {
            panic!("job must be in Funded status to accept");
        }
        if job.worker.is_some() {
            panic!("job already has a worker assigned");
        }

        job.worker = Some(worker);
        job.status = JobStatus::Accepted;
        write_job(&env, &job_id, &job);
    }

    pub fn store_nfc_challenge(
        env: Env,
        job_id: BytesN<32>,
        challenge: BytesN<32>,
        from: Address,
    ) {
        from.require_auth();

        let job = read_job(&env, &job_id);
        if job.customer != from {
            panic!("only the customer can store an NFC challenge");
        }

        write_challenge(&env, &job_id, &challenge);
    }

    pub fn release_payment(env: Env, job_id: BytesN<32>, nfc_challenge: BytesN<32>) {
        let mut job = read_job(&env, &job_id);
        if job.status != JobStatus::Accepted {
            panic!("job must be in Accepted status to release payment");
        }

        let stored = read_challenge(&env, &job_id).expect("no NFC challenge stored for this job");
        if nfc_challenge != stored {
            panic!("invalid NFC challenge");
        }

        remove_challenge(&env, &job_id);

        job.nfc_counter += 1;
        job.status = JobStatus::Paid;
        write_job(&env, &job_id, &job);
    }

    pub fn dispute(env: Env, job_id: BytesN<32>, by: Address) {
        by.require_auth();

        let mut job = read_job(&env, &job_id);
        if job.status != JobStatus::Accepted {
            panic!("only Accepted jobs can be disputed");
        }
        if by != job.customer && Some(by) != job.worker {
            panic!("only the customer or the worker can dispute");
        }

        job.status = JobStatus::Disputed;
        write_job(&env, &job_id, &job);
    }

    pub fn resolve_dispute(env: Env, job_id: BytesN<32>, winner: Address) {
        winner.require_auth();

        let mut job = read_job(&env, &job_id);
        if job.status != JobStatus::Disputed {
            panic!("job must be in Disputed status to resolve");
        }
        if winner != job.customer && Some(winner.clone()) != job.worker {
            panic!("winner must be the customer or the worker");
        }

        job.status = JobStatus::Resolved;
        job.dispute_winner = Some(winner);
        write_job(&env, &job_id, &job);
    }

    pub fn cancel_job(env: Env, job_id: BytesN<32>, by: Address) {
        by.require_auth();

        let mut job = read_job(&env, &job_id);
        match job.status {
            JobStatus::Created | JobStatus::Funded => {
                if by != job.customer {
                    panic!("only the customer can cancel before acceptance");
                }
            }
            JobStatus::Accepted => {
                if Some(by) != job.worker {
                    panic!("only the worker can cancel after acceptance");
                }
            }
            _ => panic!("job cannot be cancelled in its current status"),
        }

        job.status = JobStatus::Cancelled;
        write_job(&env, &job_id, &job);
    }

    pub fn expire_job(env: Env, job_id: BytesN<32>) {
        let mut job = read_job(&env, &job_id);
        if job.status != JobStatus::Created && job.status != JobStatus::Funded {
            panic!("only Created or Funded jobs can be expired");
        }

        let now = env.ledger().timestamp();
        if now <= job.deadline {
            panic!("job deadline has not passed");
        }

        job.status = JobStatus::Expired;
        write_job(&env, &job_id, &job);
    }

    pub fn get_job_status(env: Env, job_id: BytesN<32>) -> JobStatus {
        let job = read_job(&env, &job_id);
        job.status
    }
}
