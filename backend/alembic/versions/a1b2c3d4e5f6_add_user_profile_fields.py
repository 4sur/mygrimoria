"""Add user profile fields for personalization

Revision ID: a1b2c3d4e5f6
Revises: eb34e2b01582
Create Date: 2026-03-26

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = 'a1b2c3d4e5f6'
down_revision: Union[str, None] = 'eb34e2b01582'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('user_profiles', sa.Column('display_name', sa.String(), nullable=True))
    op.add_column('user_profiles', sa.Column('avatar_url', sa.String(), nullable=True))
    op.add_column('user_profiles', sa.Column('birth_date', sa.Date(), nullable=True))
    op.add_column('user_profiles', sa.Column('birth_place', sa.String(), nullable=True))
    op.add_column('user_profiles', sa.Column('current_place', sa.String(), nullable=True))
    op.add_column('user_profiles', sa.Column('gender', sa.String(), nullable=True))
    op.add_column('user_profiles', sa.Column('prompt_context', sa.String(), nullable=True))


def downgrade() -> None:
    op.drop_column('user_profiles', 'prompt_context')
    op.drop_column('user_profiles', 'gender')
    op.drop_column('user_profiles', 'current_place')
    op.drop_column('user_profiles', 'birth_place')
    op.drop_column('user_profiles', 'birth_date')
    op.drop_column('user_profiles', 'avatar_url')
    op.drop_column('user_profiles', 'display_name')
