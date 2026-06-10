use soroban_sdk::{contract, contractimpl, contracttype, Address, Env, Vec};

#[contracttype]
#[derive(Clone, Debug, PartialEq)]
pub enum BadgeType {
    Cleaner,
    Tutor,
    Mover,
    Delivery,
    Handyman,
    EventStaff,
    TechSupport,
    Photographer,
}

#[contracttype]
#[derive(Clone)]
pub enum DataKey {
    Badge(Address, BadgeType),
    WorkerBadgeList(Address),
}

fn read_worker_badges(env: &Env, worker: &Address) -> Vec<BadgeType> {
    env.storage()
        .instance()
        .get(&DataKey::WorkerBadgeList(worker.clone()))
        .unwrap_or(Vec::new(env))
}

fn write_worker_badges(env: &Env, worker: &Address, badges: &Vec<BadgeType>) {
    env.storage()
        .instance()
        .set(&DataKey::WorkerBadgeList(worker.clone()), badges);
}

fn badge_is_issued(env: &Env, worker: &Address, badge: &BadgeType) -> bool {
    env.storage()
        .instance()
        .get(&DataKey::Badge(worker.clone(), badge.clone()))
        .unwrap_or(false)
}

fn set_badge_flag(env: &Env, worker: &Address, badge: &BadgeType, issued: bool) {
    env.storage()
        .instance()
        .set(&DataKey::Badge(worker.clone(), badge.clone()), &issued);
}

#[contract]
pub struct BadgeRegistryContract;

#[contractimpl]
impl BadgeRegistryContract {
    pub fn issue_badge(env: Env, verifier: Address, worker: Address, badge: BadgeType) {
        verifier.require_auth();
        if badge_is_issued(&env, &worker, &badge) {
            panic!("badge already issued to this worker");
        }
        set_badge_flag(&env, &worker, &badge, true);

        let mut badges = read_worker_badges(&env, &worker);
        badges.push_back(badge);
        write_worker_badges(&env, &worker, &badges);
    }

    pub fn revoke_badge(env: Env, verifier: Address, worker: Address, badge: BadgeType) {
        verifier.require_auth();
        if !badge_is_issued(&env, &worker, &badge) {
            panic!("badge not issued to this worker");
        }
        set_badge_flag(&env, &worker, &badge, false);

        let mut badges = read_worker_badges(&env, &worker);
        let mut idx: Option<u32> = None;
        for i in 0..badges.len() {
            if badges.get(i).unwrap() == badge {
                idx = Some(i);
                break;
            }
        }
        if let Some(i) = idx {
            badges.remove(i);
        }
        write_worker_badges(&env, &worker, &badges);
    }

    pub fn get_worker_badges(env: Env, worker: Address) -> Vec<BadgeType> {
        read_worker_badges(&env, &worker)
    }

    pub fn badge_issued(env: Env, worker: Address, badge: BadgeType) -> bool {
        badge_is_issued(&env, &worker, &badge)
    }
}
