import graphene

from dormitory.schema.mutations import Mutation
from dormitory.schema.queries import Query


schema = graphene.Schema(query=Query, mutation=Mutation)
