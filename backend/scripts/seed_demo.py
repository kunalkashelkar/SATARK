#!/usr/bin/env python3
"""
SAT-SA Supervisory Demo Seeding Tool (CLI)
=========================================
Wrapper for seed_demo_data.py providing CLI command interface.
Supports: --seed, --reset, --verify
"""

import os
import sys

# Ensure backend root is on sys.path
backend_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if backend_root not in sys.path:
    sys.path.insert(0, backend_root)

from scripts.seed_demo_data import seed_database, reset_demo_data, verify_database
from app.db.session import SessionLocal
import argparse

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="SAT-SA Synthetic Demo Seeding Tool")
    parser.add_argument("--seed", action="store_true", help="Seed the demonstration dataset")
    parser.add_argument("--reset", action="store_true", help="Reset demonstration data before seeding")
    parser.add_argument("--verify", action="store_true", help="Run integrity and relationship verification checks")

    args = parser.parse_args()

    db = SessionLocal()
    try:
        if args.reset:
            reset_demo_data(db)

        if args.seed or not (args.reset or args.verify):
            seed_database(db)

        if args.verify or not args.reset:
            success = verify_database(db)
            if not success and args.verify:
                sys.exit(1)
    finally:
        db.close()
