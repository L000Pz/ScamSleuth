"""auto

Revision ID: 9217efe74921
Revises: 8f1480db4292
Create Date: 2025-03-31 13:59:17.728052

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '9217efe74921'
down_revision: Union[str, None] = '8f1480db4292'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('user_report', sa.Column('review_id', sa.Integer(), nullable=False))
    op.drop_constraint('user_report_report_id_fkey', 'user_report', type_='foreignkey')
    op.create_foreign_key(None, 'user_report', 'report', ['review_id'], ['report_id'])
    op.drop_column('user_report', 'report_id')
    # ### end Alembic commands ###


def downgrade() -> None:
    """Downgrade schema."""
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('user_report', sa.Column('report_id', sa.INTEGER(), autoincrement=False, nullable=False))
    op.drop_constraint(None, 'user_report', type_='foreignkey')
    op.create_foreign_key('user_report_report_id_fkey', 'user_report', 'report', ['report_id'], ['report_id'])
    op.drop_column('user_report', 'review_id')
    # ### end Alembic commands ###
