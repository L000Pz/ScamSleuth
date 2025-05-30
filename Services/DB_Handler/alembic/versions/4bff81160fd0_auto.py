"""auto

Revision ID: 4bff81160fd0
Revises: 6a743198b1b0
Create Date: 2025-05-13 07:48:13.219296

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '4bff81160fd0'
down_revision: Union[str, None] = '6a743198b1b0'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_table('user_report')
    op.add_column('report', sa.Column('writer_id', sa.Integer(), nullable=True))
    op.create_foreign_key(None, 'report', 'users', ['writer_id'], ['user_id'])
    op.add_column('review', sa.Column('writer_id', sa.Integer(), nullable=True))
    op.create_foreign_key(None, 'review', 'admins', ['writer_id'], ['admin_id'])
    op.add_column('review_comment', sa.Column('root_id', sa.Integer(), nullable=False))
    op.create_foreign_key(None, 'review_comment', 'review_comment', ['root_id'], ['comment_id'])
    # ### end Alembic commands ###


def downgrade() -> None:
    """Downgrade schema."""
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_constraint(None, 'review_comment', type_='foreignkey')
    op.drop_column('review_comment', 'root_id')
    op.drop_constraint(None, 'review', type_='foreignkey')
    op.drop_column('review', 'writer_id')
    op.drop_constraint(None, 'report', type_='foreignkey')
    op.drop_column('report', 'writer_id')
    op.create_table('user_report',
    sa.Column('user_id', sa.INTEGER(), autoincrement=False, nullable=False),
    sa.Column('report_id', sa.INTEGER(), autoincrement=False, nullable=False),
    sa.ForeignKeyConstraint(['report_id'], ['report.report_id'], name='user_report_report_id_fkey'),
    sa.ForeignKeyConstraint(['user_id'], ['users.user_id'], name='user_report_user_id_fkey'),
    sa.PrimaryKeyConstraint('user_id', 'report_id', name='user_report_pkey')
    )
    # ### end Alembic commands ###
